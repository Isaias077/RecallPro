/* eslint-disable */
import { useState } from 'react';
import styled from '@emotion/styled';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #8B48BD 0%, #87C8E4 100%);
  padding: 20px;
`;

const CardContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px; /* Always reserve space for rating section */
  transition: all 0.3s ease;
`;

const BaseCard = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 34px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ThirdCard = styled(BaseCard)`
  background: #C6E8E8;
  opacity: 0.54;
  width: 100%;
  max-width: 550px;
  transform: scale(0.701) translateY(135px);
  z-index: 1;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const SecondCard = styled(BaseCard)`
  background: #C6E8E8;
  transform: scale(0.857) translateY(40px);
  max-width: 515px;
  height: 430px;
  width: 100%;
  z-index: 2;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const AnswerText = styled.p`
  color: #333;
  text-align: center;
  margin: 20px 0;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s ease-out forwards;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AnswerButton = styled.button`
  background: #8B48BD;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #7b3dad;
  }
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
  opacity: 0;
  visibility: ${({ show }: { show?: boolean }) => show ? 'visible' : 'hidden'};
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  transition: visibility 0s, opacity 0.6s ease-out;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const DifficultyContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
`;

const DifficultyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  transition: transform 0.2s ease;
  background-color: white;
  border-radius: 100%;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  margin-bottom: 5px;
  padding: 10px;
  opacity: 0;
  transform: scale(0.8);
  animation: popIn 0.4s ease-out forwards;
  
  &:nth-of-type(1) {
    animation-delay: 0.3s;
  }
  
  &:nth-of-type(2) {
    animation-delay: 0.4s;
  }
  
  &:nth-of-type(3) {
    animation-delay: 0.5s;
  }
  
  @keyframes popIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &:hover {
    transform: scale(1.2);
  }
`;

export default function QuizPage() {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <PageContainer> 
      <CardContainer>
        <ThirdCard />
        <SecondCard />
        <BaseCard className='mainCard' style={{ left: 0, right: 0, margin: '0 auto' }}>
          <h2>
            ¿Qué dio a inicio a la Segunda Guerra Mundial?
          </h2>
          
          {showAnswer && (
            <AnswerText>
              La invasión de Polonia por la Alemania nazi el 1 de septiembre de 1939.
            </AnswerText>
          )}
          <br />
          <AnswerButton onClick={() => setShowAnswer(!showAnswer)}>
            {showAnswer ? 'Siguiente Pregunta' : 'RESPUESTA'}
          </AnswerButton>
        </BaseCard>
      </CardContainer>
      
      <RatingSection show={showAnswer}>
        <h2>¿Que te parecio?</h2>
        <DifficultyContainer>
          <div className="fDc">
          <DifficultyButton title="Difícil">👎</DifficultyButton>
          Dificil
          </div>
          <div className="fDc">
          <DifficultyButton title="Normal">😐</DifficultyButton>
          Normal
          </div>
          <div className="fDc">
          <DifficultyButton title="Fácil">👍</DifficultyButton>
          Facil
          </div>
        </DifficultyContainer>
      </RatingSection>
    </PageContainer>
  );
}