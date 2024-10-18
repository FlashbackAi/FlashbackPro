const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const { ENV, AWS} = require('./config', 'aws-sdk');


const logFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  );
  
const logger = winston.createLogger({
  level: ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/application.log' }),
    new WinstonCloudWatch({
      logGroupName: 'Flashback/ApplicationLogs',
      logStreamName: `${ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: 'ap-south-1',
      jsonMessage: true,
      messageFormatter: ({ level, message, additionalInfo }) => 
        JSON.stringify({ level, message, additionalInfo, timestamp: new Date().toISOString() }),
      uploadRate: 2000,
      errorHandler: (err) => console.error('CloudWatch error', err)
    })
  ]
});



module.exports = logger;