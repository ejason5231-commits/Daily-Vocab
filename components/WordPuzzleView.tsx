import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VocabularyWord } from '../types';
import { POINTS } from '../gamificationConstants';
import { RefreshIcon } from './icons';

interface WordPuzzleViewProps {
  learnedWords: Set<string>;
  allWords: VocabularyWord[];
  addPoints: (points: number) => void;
}

const GRID_SIZE = 12;
const MAX_WORDS = 10;

interface Cell {
  letter: string;
  isFound: boolean;
}

interface SelectionCell {
  row: number;
  col: number;
}

const directions = [
  { dr: 0, dc: 1 },  // Horizontal
  { dr: 1, dc: 0 },  // Vertical
  { dr: 1, dc: 1 },  // Diagonal down-right
  { dr: 1, dc: -1 }, // Diagonal down-left
];

const generatePuzzle = (words: string[]): { grid: string[][]; placedWords: Map<string, any> } | null => {
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placedWords = new Map();

  for (const word of words) {
    const cleanWord = word.split('(')[0].trim().toUpperCase();
    if (cleanWord.length > GRID_SIZE) continue;

    let placed = false;
    for (let attempts = 0; attempts < 100; attempts++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      let canPlace = true;
      const path = [];
      for (let i = 0; i < cleanWord.length; i++) {
        const newRow = row + i * dir.dr;
        const newCol = col + i * dir.dc;

        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE || (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== cleanWord[i])) {
          canPlace = false;
          break;
        }
        path.push({ row: newRow, col: newCol });
      }

      if (canPlace) {
        for (let i = 0; i < cleanWord.length; i++) {
          grid[path[i].row][path[i].col] = cleanWord[i];
        }
        placedWords.set(cleanWord, path);
        placed = true;
        break;
      }
    }
    if (!placed) {
      console.warn(`Could not place word: ${cleanWord}`);
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      }
    }
  }
  
  return { grid, placedWords };
};


const WordPuzzleView: React.FC<WordPuzzleViewProps> = ({ learnedWords, allWords, addPoints }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [placedWordsMap, setPlacedWordsMap] = useState<Map<string, any>>(new Map());
  
  const [selection, setSelection] = useState<SelectionCell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const createNewPuzzle = useCallback(() => {
    const filterAndMap = (words: VocabularyWord[]) =>
      words
        .map(w => w.word.split('(')[0].trim().toUpperCase())
        .filter(w => !w.includes(' ') && w.length <= GRID_SIZE);

    let candidateWords = filterAndMap(allWords.filter(w => learnedWords.has(w.word)));

    if (candidateWords.length < 4) {
      candidateWords = filterAndMap(allWords);
    }

    const puzzleWords = candidateWords
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_WORDS);
      
    if (puzzleWords.length > 3) {
      const result = generatePuzzle(puzzleWords);
      if (result && result.placedWords.size > 0) {
        const initialGrid = result.grid.map(row => row.map(letter => ({ letter, isFound: false })));
        setGrid(initialGrid);
        const wordsThatWerePlaced = Array.from(result.placedWords.keys());
        setWordsToFind(wordsThatWerePlaced);
        setPlacedWordsMap(result.placedWords);
        setFoundWords(new Set());
        setSelection([]);
      } else {
         setWordsToFind([]);
      }
    } else {
      setWordsToFind([]);
    }
  }, [learnedWords, allWords]);

  useEffect(() => {
    createNewPuzzle();
  }, [createNewPuzzle]);
  
  const handleSelectionStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelection([{ row, col }]);
  };

  const handleSelectionMove = (row: number, col: number) => {
    if (!isSelecting || !selection[0]) return;
    
    const startCell = selection[0];
    const newSelection: SelectionCell[] = [startCell];

    const dr = row - startCell.row;
    const dc = col - startCell.col;

    // Check for straight or diagonal line
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        const stepDr = Math.sign(dr);
        const stepDc = Math.sign(dc);

        for (let i = 1; i <= steps; i++) {
            newSelection.push({
                row: startCell.row + i * stepDr,
                col: startCell.col + i * stepDc
            });
        }
    }
    setSelection(newSelection);
  };

  const handleSelectionEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (selection.length > 1) {
        const selectedWord = selection.map(cell => grid[cell.row][cell.col].letter).join('');
        const reversedSelectedWord = selectedWord.split('').reverse().join('');

        const foundWord = [selectedWord, reversedSelectedWord].find(w => wordsToFind.includes(w) && !foundWords.has(w));
        
        if (foundWord) {
            setFoundWords(prev => new Set(prev).add(foundWord));
            addPoints(POINTS.FIND_WORD * foundWord.length);
            
            const newGrid = grid.map(r => r.map(cell => ({...cell}))); // Deep copy
            selection.forEach(({ row, col }) => {
                if (newGrid[row] && newGrid[row][col]) {
                  newGrid[row][col].isFound = true;
                }
            });
            setGrid(newGrid);
        }
    }
    
    setSelection([]);
  };
  
  useEffect(() => {
    if(wordsToFind.length > 0 && foundWords.size === wordsToFind.length) {
      addPoints(POINTS.COMPLETE_PUZZLE_BONUS);
    }
  }, [foundWords, wordsToFind, addPoints]);

  const isCellSelected = (row: number, col: number) => {
      return selection.some(cell => cell.row === row && cell.col === col);
  }

  if (wordsToFind.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Word Puzzle</h2>
        <p className="text-gray-600 dark:text-gray-400">Learn at least 4 words to generate a puzzle!</p>
      </div>
    );
  }

  const allWordsFound = foundWords.size === wordsToFind.length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto" onMouseUp={handleSelectionEnd} onMouseLeave={handleSelectionEnd}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 w-full md:w-80">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
             <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Words to Find</h3>
             <ul className="space-y-1">
               {wordsToFind.map(word => (
                 <li key={word} className={`text-gray-700 dark:text-gray-300 transition-all duration-300 ${foundWords.has(word) ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                   {word}
                 </li>
               ))}
             </ul>
             {allWordsFound && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                    <p className="font-bold text-green-700 dark:text-green-300">Congratulations!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">You found all the words!</p>
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">+{POINTS.COMPLETE_PUZZLE_BONUS} bonus points!</p>
                </div>
             )}
              <button onClick={createNewPuzzle} className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                <RefreshIcon className="h-5 w-5" />
                <span>New Puzzle</span>
              </button>
           </div>
        </div>
        <div className="flex-grow">
          <div 
            className="grid gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner select-none"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            onMouseLeave={() => isSelecting && handleSelectionEnd()}
           >
            {grid.map((row, rowIndex) => 
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-full aspect-square flex items-center justify-center text-sm sm:text-base font-bold uppercase rounded-sm transition-colors duration-150 cursor-pointer
                    ${cell.isFound ? 'bg-yellow-400 dark:bg-yellow-600 text-white' : ''}
                    ${isCellSelected(rowIndex, colIndex) ? 'bg-blue-400 dark:bg-blue-600 text-white scale-110' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600'}
                  `}
                  onMouseDown={() => handleSelectionStart(rowIndex, colIndex)}
                  onMouseOver={() => handleSelectionMove(rowIndex, colIndex)}
                >
                  {cell.letter}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleView;
