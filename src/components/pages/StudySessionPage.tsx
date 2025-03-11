import React from 'react';
import { useParams } from 'react-router-dom';
import StudySession from '../flashcards/StudySession';

/**
 * StudySessionPage component
 * 
 * A page component that provides an interface for studying flashcards with spaced repetition.
 * This page uses the StudySession organism and is mapped to the /study/:deckId route.
 */
const StudySessionPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();

  return (<StudySession />);
};

export default StudySessionPage;