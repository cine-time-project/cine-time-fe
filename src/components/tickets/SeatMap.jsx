import React from 'react';

const SeatMap = ({ rows, cols, selectedSeats, onToggleSeat }) => {
  const rowLetters = Array.from({ length: rows }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const isSelected = (seat) => selectedSeats.includes(seat);

  return (
    <div className="table-responsive">
      <table className="table table-borderless text-center">
        <tbody>
          {rowLetters.map((letter) => (
            <tr key={letter}>
              {Array.from({ length: cols }, (_, i) => {
                const seatNumber = i + 1;
                const seatId = `${letter}${seatNumber}`;
                const btnClass = isSelected(seatId)
                  ? 'btn btn-success'
                  : 'btn btn-outline-secondary';

                return (
                  <td key={seatId} className="p-1">
                    <button
                      type="button"
                      className={btnClass}
                      onClick={() => onToggleSeat(letter, seatNumber)}
                    >
                      {seatId}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeatMap;
