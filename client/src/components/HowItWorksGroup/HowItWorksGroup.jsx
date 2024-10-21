import React from "react";
import styled from "styled-components";
import { HOW_IT_WORKS_STRING, QAGroups } from "../../helpers/constants";
import QAExpandComponent from "../QAExpandComponent/QAExpandComponent";

const HowItWorksContainer = styled.div`
  color: #ffffff;
  width: 26.875rem;

  @media (max-width: 768px) {
    width: 80%;
  }
`;

const Heading = styled.span`
  font-weight: 600;
  font-size: 2.125rem;
  margin-bottom: 1.75rem;
  display: block;
  color: #00ffff;
`;

const Line = styled.hr`
  margin: 0 0 1.75rem 0;
  background-color: #00ffff;
  border: none;
  height: 1px;
  opacity: 0.5;
`;

const QAGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const HowItWorksGroup = ({ index }) => {
  return (
    <HowItWorksContainer>
      <Heading>{HOW_IT_WORKS_STRING}</Heading>
      <Line />
      <QAGroupContainer>
        {QAGroups[index].map((group, i) => (
          <QAExpandComponent key={i} group={group} />
        ))}
      </QAGroupContainer>
    </HowItWorksContainer>
  );
};

export default HowItWorksGroup;