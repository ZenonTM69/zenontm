// A calm background: two slow-moving colour glows on near-black.
export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  );
}
