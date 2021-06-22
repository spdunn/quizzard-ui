import { configureStore } from "@reduxjs/toolkit";
import createQuizReducer from "../StateSlices/CreateQuiz/createQuizSlice";
import flashcardsReducer from "../StateSlices/Flashcard/flashcardsSlice";
import subjectsReducer from "../StateSlices/Subject/subjectsSlice";
import quizResultsReducer from "../StateSlices/CreateQuiz/resultSlice";
import setListReducer from '../StateSlices/Sets/setListSlice';

export const store = configureStore({
    reducer: {
        createQuiz: createQuizReducer,
        flashcards: flashcardsReducer,
        subjects: subjectsReducer,
        result: quizResultsReducer,
        setList: setListReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;