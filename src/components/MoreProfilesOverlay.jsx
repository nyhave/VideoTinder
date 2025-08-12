import React from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';

export default function MoreProfilesOverlay({ hasFree, canBuy, onClaimFree, onBuy, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4 text-pink-600 text-center">Flere klip</h2>
        {hasFree && (
          <Button className="w-full bg-green-500 text-white mb-2" onClick={onClaimFree}>
            Få 3 gratis profiler
          </Button>
        )}
        {canBuy && (
          <Button className="w-full bg-yellow-500 text-white mb-2" onClick={onBuy}>
            Køb 3 ekstra for 9 kr (gratis nu - betaling ikke implementeret)
          </Button>
        )}
        <Button className="w-full bg-gray-200 text-black" onClick={onClose}>
          Luk
        </Button>
      </Card>
    </div>
  );
}
