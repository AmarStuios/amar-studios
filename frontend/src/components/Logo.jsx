const CHAIN = ['/logo.jpeg', '/logo.jpg', '/logo.png', '/logo.svg'];

export default function Logo({ size = 40 }) {
  return (
    <img
      src={CHAIN[0]}
      alt="AMAR Studios"
      style={{ height: size, width: 'auto', display: 'block', objectFit: 'contain' }}
      onError={(e) => {
        const i = parseInt(e.currentTarget.dataset.i || '0', 10);
        if (i + 1 < CHAIN.length) {
          e.currentTarget.dataset.i = String(i + 1);
          e.currentTarget.src = CHAIN[i + 1];
        }
      }}
    />
  );
}
