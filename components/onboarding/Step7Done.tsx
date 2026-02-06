"use client";

interface Step7DoneProps {
  northStars: {
    wealth: string;
    health: string;
    love: string;
    happiness: string;
  };
}

export default function Step7Done({ northStars }: Step7DoneProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Alles eingerichtet!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Dein Dashboard ist bereit. Hier sind deine North Stars für dieses Jahr:
        </p>

        <div className="space-y-4 text-left max-w-xl mx-auto">
          <div className="border border-border/60 rounded-lg p-4">
            <div className="font-medium mb-1">💰 WEALTH</div>
            <p className="text-muted-foreground">{northStars.wealth}</p>
          </div>
          <div className="border border-border/60 rounded-lg p-4">
            <div className="font-medium mb-1">🏃 HEALTH</div>
            <p className="text-muted-foreground">{northStars.health}</p>
          </div>
          <div className="border border-border/60 rounded-lg p-4">
            <div className="font-medium mb-1">❤️ LOVE</div>
            <p className="text-muted-foreground">{northStars.love}</p>
          </div>
          <div className="border border-border/60 rounded-lg p-4">
            <div className="font-medium mb-1">😊 HAPPINESS</div>
            <p className="text-muted-foreground">{northStars.happiness}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Du wirst in wenigen Sekunden weitergeleitet...
      </p>
    </div>
  );
}
