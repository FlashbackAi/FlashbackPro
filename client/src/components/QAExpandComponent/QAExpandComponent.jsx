import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

const QAContainer = styled(motion.div)`
  margin-bottom: 1.25rem;
`;

const QuestionBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: all 0.3s ease;

  &:hover {
    color: #00ffff;
  }
`;

const Question = styled.span`
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.5;
`;

const ChevronIcon = styled(motion.div)`
  color: #00ffff;
`;

const Answer = styled(motion.div)`
  padding-top: 0.75rem;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
`;

const Line = styled.hr`
  margin: 1.25rem 0;
  background-color: rgba(0, 255, 255, 0.2);
  border: none;
  height: 1px;
`;

const QAExpandComponent = ({ group }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setIsOpen(false); // Close the answer when scrolling out of view
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the component is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 300); // Delay opening to allow for the entry animation
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <QAContainer
      ref={containerRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
      transition={{ duration: 0.5 }}
    >
      <QuestionBox onClick={handleClick}>
        <Question>{group.question}</Question>
        <ChevronIcon
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </ChevronIcon>
      </QuestionBox>
      <AnimatePresence>
        {isOpen && (
          <Answer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {group.answer}
          </Answer>
        )}
      </AnimatePresence>
      <Line />
    </QAContainer>
  );
};

export default QAExpandComponent;