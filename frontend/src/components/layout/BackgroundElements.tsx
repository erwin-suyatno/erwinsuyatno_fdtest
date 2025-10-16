export default function BackgroundElements() {
  return (
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-10 left-10 text-6xl animate-pulse">🌲</div>
      <div className="absolute top-20 right-20 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
      <div className="absolute bottom-10 right-10 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌱</div>
      <div className="absolute top-1/2 left-5 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🌳</div>
      <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: '2.5s' }}>🌾</div>
    </div>
  );
}
