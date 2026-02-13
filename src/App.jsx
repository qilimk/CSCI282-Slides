import { useState } from 'react'
import './App.css'
import ChaptersList from './ChaptersList'
import Chapter1 from './chapter1'
import Chapter2 from './chapter2'
import Chapter3 from './chapter3'
import Chapter4 from './chapter4'
import Chapter5 from './chapter5'
import Chapter6 from './chapter6'
import Chapter7 from './chapter7'
import Chapter8 from './chapter8'
import Chapter9 from './chapter9'
import Chapter10 from './chapter10'
import Chapter11 from './chapter11'
import Chapter12 from './chapter12'

const CHAPTERS = [
  { id: 1, Component: Chapter1 },
  { id: 2, Component: Chapter2 },
  { id: 3, Component: Chapter3 },
  { id: 4, Component: Chapter4 },
  { id: 5, Component: Chapter5 },
  { id: 6, Component: Chapter6 },
  { id: 7, Component: Chapter7 },
  { id: 8, Component: Chapter8 },
  { id: 9, Component: Chapter9 },
  { id: 10, Component: Chapter10 },
  { id: 11, Component: Chapter11 },
  { id: 12, Component: Chapter12 },
]

function getChapterById(id) {
  return CHAPTERS.find((ch) => ch.id === id)
}

export default function App() {
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const chapter = selectedChapterId ? getChapterById(selectedChapterId) : null

  if (!chapter) {
    return (
      <ChaptersList
        onSelectChapter={(id) => setSelectedChapterId(id)}
      />
    )
  }

  const { Component } = chapter
  return (
    <>
      <Component onBackToChapters={() => setSelectedChapterId(null)} />
    </>
  )
}
