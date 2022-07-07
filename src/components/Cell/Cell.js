import './Cell.scss';

export function Cell({id, onClick, isSelected}) {
  return (
    <div className={isSelected ? 'Cell__container Cell__selected' : 'Cell__container'} onClick={onClick}>
      {id}
    </div>
  )
}
