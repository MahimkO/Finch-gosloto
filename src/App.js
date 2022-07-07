import { Ticket } from './components/Ticket';

import './App.scss';

function App() {
  return (
    <div className='App__container'>
      <Ticket className='App__ticket' ticketId={1}/>
    </div>
  );
}

export default App;
