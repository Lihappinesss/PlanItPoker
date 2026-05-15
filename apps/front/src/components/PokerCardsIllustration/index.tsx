import styles from './index.module.scss';

const cards = [
  { value: '1', rotate: -30, x: 32, y: 38 },
  { value: '2', rotate: -22, x: 64, y: 22 },
  { value: '3', rotate: -14, x: 98, y: 12 },
  { value: '5', rotate: -6, x: 134, y: 6 },
  { value: '5', rotate: 2, x: 170, y: 6 },
  { value: '8', rotate: 10, x: 206, y: 14 },
  { value: '?', rotate: 18, x: 242, y: 30, accent: true },
];

const PokerCardsIllustration = () => {
  return (
    <div className={styles.illustration} aria-hidden='true'>
      <svg
        viewBox='0 0 470 230'
        className={styles.svg}
        role='img'
      >
        <path
          d='M46 72C98 22 153 30 192 63C143 38 92 45 52 88C91 63 147 53 207 76'
          className={styles.sketchLine}
        />

        <path
          d='M314 18L296 56'
          className={styles.blueStroke}
        />
        <path
          d='M344 36L320 66'
          className={styles.blueStroke}
        />
        <path
          d='M370 68L334 78'
          className={styles.blueStroke}
        />

        {cards.map((card, index) => (
          <g
            key={`${card.value}-${index}`}
            transform={`translate(${card.x} ${card.y}) rotate(${card.rotate} 52 72)`}
          >
            <rect
              x='0'
              y='0'
              width='104'
              height='144'
              rx='16'
              className={styles.card}
            />

            <text
              x='22'
              y='34'
              className={styles.cardNumber}
            >
              {card.value}
            </text>

            {card.accent && (
              <>
                <text
                  x='42'
                  y='88'
                  className={styles.cardLetter}
                >
                  P
                </text>

                <path
                  d='M48 112C54 106 64 107 68 115C61 113 55 117 51 124C49 119 47 116 48 112Z'
                  className={styles.suit}
                />
              </>
            )}
          </g>
        ))}

        <g className={styles.dots}>
          {Array.from({ length: 24 }).map((_, index) => {
            const col = index % 6;
            const row = Math.floor(index / 6);

            return (
              <circle
                key={index}
                cx={330 + col * 16}
                cy={126 + row * 16}
                r='3'
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default PokerCardsIllustration;