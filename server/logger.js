const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const { ENV, AWS } = require('./config', 'aws-sdk');

// Common format for all environments
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Base transports that will be used in all environments
const baseTransports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),
  new winston.transports.File({ 
    filename: 'logs/application.log',
    format: logFormat
  })
];

// Production-only transports
const productionTransports = [
  new WinstonCloudWatch({
    logGroupName: 'Flashback/ApplicationLogs',
    logStreamName: `${ENV}-${new Date().toISOString().split('T')[0]}`,
    awsRegion: 'ap-south-1',
    jsonMessage: true,
    messageFormatter: ({ level, message, additionalInfo }) => 
      JSON.stringify({ 
        level, 
        message, 
        additionalInfo,
        environment: ENV,
        timestamp: new Date().toISOString() 
      }),
    uploadRate: 2000,
    errorHandler: (err) => console.error('CloudWatch error:', err)
  })
];

// Create the logger with environment-specific configuration
const logger = winston.createLogger({
  level: ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: ENV === 'production' 
    ? [...baseTransports, ...productionTransports]
    : baseTransports
});

// Add a startup message to verify the environment
logger.info(`Logger initialized in ${ENV} environment`);

module.exports = logger;