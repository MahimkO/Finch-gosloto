import { useState } from 'react';
import { Cell } from '../Cell/Cell';

import './Ticket.scss';

export function Ticket({ticketId}) {
  const [firstBlockCells, setFirstBlockCells] = useState({});
  const [firstBlockSelectedDigits, setFirstBlockSelectedDigits] = useState(0);
  const [secondBlockCells, setSecondBlockCells] = useState({});
  const [secondBlockSelectedDigits, setSecondBlockSelectedDigits] = useState(0);
  const [result, setResult] = useState();

  const handleFirstBlockCell = (id) => {
    if (!firstBlockCells[id] && firstBlockSelectedDigits < 8) {
      setFirstBlockCells(prev => ({
        ...prev,
        [id]: true
      }));
      setFirstBlockSelectedDigits(firstBlockSelectedDigits + 1);
    }

    if (firstBlockCells[id]) {
      setFirstBlockCells(prev => ({
        ...prev,
        [id]: false
      }));
      setFirstBlockSelectedDigits(firstBlockSelectedDigits - 1);
    }
  };

  const handleSecondBlockCell = (id) => {
    if (!secondBlockCells[id] && secondBlockSelectedDigits < 1) {
      setSecondBlockCells(prev => ({
        ...prev,
        [id]: true
      }));
      setSecondBlockSelectedDigits(secondBlockSelectedDigits + 1);
    }

    if (secondBlockCells[id]) {
      setSecondBlockCells(prev => ({
        ...prev,
        [id]: false
      }));
      setSecondBlockSelectedDigits(secondBlockSelectedDigits - 1);
    }
  };

  const handleMagicWand = () => {
    setFirstBlockCells({});
    setSecondBlockCells({});

    const [firstBlockRandomNumbers, secondBlockRandomNumbers] = generateArraysWithRandomNumbers();
    
    firstBlockRandomNumbers.forEach(id => {
      setFirstBlockCells(prev => ({
        ...prev,
        [id]: true
      }));
    });

    secondBlockRandomNumbers.forEach(id => {
      setSecondBlockCells(prev => ({
        ...prev,
        [id]: true
      }));
    });
  };

  const generateArraysWithRandomNumbers = () => {
    const firstBlockRandomNumbers = [], secondBlockRandomNumbers = [], firstBlockMaxNumber = 19, firstBlockMinNumber = 1, secondBlockMaxNumber = 2, secondBlockMinNumber = 1;

    while (firstBlockRandomNumbers.length < 8) {
      const randomNumber = Math.floor(Math.random() * (firstBlockMaxNumber - firstBlockMinNumber + 1)) + firstBlockMinNumber;
      if (!firstBlockRandomNumbers.includes(randomNumber)) firstBlockRandomNumbers.push(randomNumber);
    }

    while (secondBlockRandomNumbers.length < 1) {
      const randomNumber = Math.floor(Math.random() * (secondBlockMaxNumber - secondBlockMinNumber + 1)) + secondBlockMinNumber;
      if (!secondBlockRandomNumbers.includes(randomNumber)) secondBlockRandomNumbers.push(randomNumber);
    }

    return [firstBlockRandomNumbers, secondBlockRandomNumbers];
  };

  const handleResultButton = async () => {
    const [firstBlockRandomNumbers, secondBlockRandomNumbers] = generateArraysWithRandomNumbers();
    const firstBlockIdenticalNumbers = [], secondBlockIdenticalNumbers = [];
    const firstBlockSelectedNumbers = [], secondBlockSelectedNumbers = [];
    let isWon = false;

    const firstBlockState = Object.entries(firstBlockCells);
    for (let i = 0; i < firstBlockState.length; i += 1) {
      if (firstBlockState[i][1] === true) firstBlockSelectedNumbers.push(+firstBlockState[i][0]);
      if (firstBlockState[i][1] === true && firstBlockRandomNumbers.includes(+firstBlockState[i][0])) {
        firstBlockIdenticalNumbers.push(firstBlockState[i][0]);
      }
    }

    const secondBlockState = Object.entries(secondBlockCells);
    for (let i = 0; i < secondBlockState.length; i += 1) {
      if (secondBlockState[i][1] === true) secondBlockSelectedNumbers.push(+secondBlockState[i][0]);
      if (secondBlockState[i][1] === true && secondBlockRandomNumbers.includes(+secondBlockState[i][0])) {
        secondBlockIdenticalNumbers.push(secondBlockState[i][0]);
      }
    }
    
    if ((firstBlockIdenticalNumbers.length >= 3 && secondBlockIdenticalNumbers.length >= 1) || (firstBlockIdenticalNumbers.length > 3)) {
      setResult({
        isWon: true,
        message: 'Ого, Вы выиграли! Поздравляем!',
        numbers: {
          firstBlockIdenticalNumbers,
          secondBlockIdenticalNumbers
        }
      });
      isWon = true;
    } else {
      setResult({
        isWon: false,
        message: 'К сожалению, Вы не выиграли :('
      });
    }

    // ОТПРАВЛЯЕМ ДАННЫЕ НА БЭК
    const response = await sendDataToBack(isWon, firstBlockSelectedNumbers, secondBlockSelectedNumbers);

    // без setInterval
    // if (!response.ok) {
    //   let attemptsToConnectWithBack = 0;
    //   while (attemptsToConnectWithBack < 2) {
    //     const newResponse = await sendDataToBack(isWon, firstBlockSelectedNumbers, secondBlockSelectedNumbers);
    //     if (newResponse.ok) {
    //       const result = await newResponse.json();
    //       return result;
    //     }
    //     attemptsToConnectWithBack += 1;
    //   }
    //   console.log(`Error: ${response.status}`);
    // }

    if (!response.ok) {
      let attemptsToConnectWithBack = 0;
      let responseId = setInterval(async () => {
        const newResponse = await sendDataToBack(isWon, firstBlockSelectedNumbers, secondBlockSelectedNumbers);
        if (newResponse.ok) {
          const result = await newResponse.json();
          clearInterval(responseId);
          return result;
        }
        attemptsToConnectWithBack += 1;
        console.log(`attempt ${attemptsToConnectWithBack}`)
        if (attemptsToConnectWithBack === 2) {
          console.log(`Error: ${response.status}`);
          clearInterval(responseId);
        }
      }, 2000);
    }
  };

  const sendDataToBack = async (isWon, firstBlockSelectedNumbers, secondBlockSelectedNumbers) => {
    const url = 'http://yandex.ru/';
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedNumber: {
          firstField: firstBlockSelectedNumbers,
          secondField: secondBlockSelectedNumbers
        },  
        isTicketWon: isWon
      })
    });

    return response;
  };

  return (
    <div className='Ticket__container'>

      {result
        ? (
          <div className='Ticket__main_block'>
            <div className='Ticket__title'>
              <span>Билет {ticketId}</span>
            </div>
            {result.isWon 
            ? (
              <div className='Ticket__result'>
                <p>{result.message}</p>
                <p>В Поле 1 Вы угадали цифры: {result.numbers.firstBlockIdenticalNumbers.join(',')}</p>
                {result.numbers.secondBlockIdenticalNumbers.length > 0 
                ? (
                  <p>В Поле 2 Вы угадали цифры: {result.numbers.secondBlockIdenticalNumbers}</p>
                  ) 
                : null }                
                <p>Всего цифр угадано: {result.numbers.firstBlockIdenticalNumbers.length + result.numbers.secondBlockIdenticalNumbers.length}</p>
              </div>
            )
            : (
              <div className='Ticket__result'>
                <p>{result.message}</p>
              </div>
            )}
          </div>
        )
        : (
          <>
            <div className='Ticket__main_block'>
              <div className='Ticket__title'>
                <span>Билет {ticketId}</span>
                <svg className='Ticket__magic_wand' onClick={handleMagicWand} viewBox="0 0 23 23" fill="#000" width="20" height="20"><path d="M13 3C13.5523 3 14 3.44772 14 4V6C14 6.55228 13.5523 7 13 7C12.4477 7 12 6.55228 12 6V4C12 3.44772 12.4477 3 13 3ZM13 15C13.5523 15 14 15.4477 14 16V18C14 18.5523 13.5523 19 13 19C12.4477 19 12 18.5523 12 18V16C12 15.4477 12.4477 15 13 15ZM18.6569 6.75734C19.0474 6.36681 19.0474 5.73365 18.6569 5.34313C18.2664 4.9526 17.6332 4.9526 17.2427 5.34313L15.8285 6.75734C15.438 7.14786 15.438 7.78103 15.8285 8.17155C16.219 8.56208 16.8522 8.56208 17.2427 8.17155L18.6569 6.75734ZM7.34319 5.34315C7.73371 4.95263 8.36688 4.95263 8.7574 5.34315L10.1716 6.75737C10.5621 7.14789 10.5621 7.78106 10.1716 8.17158C9.78109 8.56211 9.14792 8.56211 8.7574 8.17158L7.34319 6.75737C6.95266 6.36684 6.95266 5.73368 7.34319 5.34315ZM17.2427 13.8284C16.8522 13.4379 16.219 13.4379 15.8285 13.8284C15.4379 14.219 15.4379 14.8521 15.8285 15.2426L17.2427 16.6569C17.6332 17.0474 18.2664 17.0474 18.6569 16.6569C19.0474 16.2663 19.0474 15.6332 18.6569 15.2426L17.2427 13.8284ZM5 11C5 10.4477 5.44771 10 6 10H8C8.55229 10 9 10.4477 9 11C9 11.5523 8.55229 12 8 12H6C5.44772 12 5 11.5523 5 11ZM18 10C17.4477 10 17 10.4477 17 11C17 11.5523 17.4477 12 18 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H18ZM14 11.5L12.5 10L3 19.5L4.5 21L14 11.5Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </div>
              <div className='Ticket__first_block'>
                <div className='Ticket__first_block_title'>
                  <span>
                    Поле 1
                  </span>
                  <span>
                    Отметьте 8 чисел
                  </span>
                </div>
                <div className='Ticket__first_block_cells'>
                  <Cell isSelected={firstBlockCells[1]} id={1} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[2]} id={2} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[3]} id={3} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[4]} id={4} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[5]} id={5} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[6]} id={6} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[7]} id={7} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[8]} id={8} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[9]} id={9} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[10]} id={10} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[11]} id={11} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[12]} id={12} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[13]} id={13} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[14]} id={14} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[15]} id={15} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[16]} id={16} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[17]} id={17} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[18]} id={18} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                  <Cell isSelected={firstBlockCells[19]} id={19} onClick={(e) => handleFirstBlockCell(e.target.textContent)}/>
                </div>
              </div>
              <div className='Ticket__second_block'>
              <div className='Ticket__second_block_title'>
                  <span>
                    Поле 2
                  </span>
                  <span>
                    Отметьте 1 число
                  </span>
                </div>
                <div className='Ticket__second_block_cells'>
                  <Cell isSelected={secondBlockCells[1]} id={1} onClick={(e) => handleSecondBlockCell(e.target.textContent)}/>
                  <Cell isSelected={secondBlockCells[2]} id={2} onClick={(e) => handleSecondBlockCell(e.target.textContent)}/>
                </div>
              </div>
            </div>

            <div className='Ticket__button_container'>
              <input className='Ticket__button' onClick={handleResultButton} type='button' value='Показать результат'/>
            </div>
          </>
        )
      }

    </div>
  )
}
