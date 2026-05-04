'use client';

import { useState, useTransition } from 'react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

import { formatMoney } from '@/lib/utils/format';
import type { Deal, DealStageCode } from '@/lib/types';

import { moveDealStageAction } from '../actions';

interface Stage {
  code: DealStageCode;
  name: string;
  color: string;
}

interface Props {
  stages: Stage[];
  deals: Deal[];
}

function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-bg-2 rounded-xl p-3 hover:border-gold/40 transition-colors cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 shadow-lg' : ''
      }`}
    >
      <div className="font-medium text-navy text-sm">{deal.title}</div>
      <div className="text-xs text-text-mid mt-1">{deal.clientName}</div>
      <div className="text-xs font-mono text-navy mt-2">
        {formatMoney(deal.amount, deal.currency)}
      </div>
      {deal.ownerName && (
        <div className="text-[10px] text-text-mid mt-1">👤 {deal.ownerName}</div>
      )}
    </div>
  );
}

function Column({
  stage,
  items,
}: {
  stage: Stage;
  items: Deal[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.code });
  const sum = items.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="min-w-[260px] flex-1">
      <div
        className="rounded-xl px-3 py-2 mb-2 flex items-center justify-between text-sm font-medium text-white"
        style={{ background: stage.color }}
      >
        <span>{stage.name}</span>
        <span className="text-xs opacity-80">{items.length}</span>
      </div>
      <div className="text-xs text-text-mid mb-2 px-1">{formatMoney(sum)}</div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[120px] rounded-xl p-1 transition-colors ${
          isOver ? 'bg-gold/10 outline outline-2 outline-gold/40' : ''
        }`}
      >
        {items.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
        {items.length === 0 && (
          <div className="text-xs text-text-mid italic px-2 py-4 text-center">пусто</div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ stages, deals }: Props) {
  const [items, setItems] = useState(deals);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(e: DragEndEvent) {
    const dealId = String(e.active.id);
    const targetStage = e.over?.id as DealStageCode | undefined;
    if (!targetStage) return;
    const deal = items.find((d) => d.id === dealId);
    if (!deal || deal.stageCode === targetStage) return;

    // Optimistic UI: меняем стадию локально, потом фоном — server action
    setItems((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageCode: targetStage } : d)),
    );
    startTransition(async () => {
      await moveDealStageAction(dealId, targetStage);
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <Column
            key={stage.code}
            stage={stage}
            items={items.filter((d) => d.stageCode === stage.code)}
          />
        ))}
      </div>
    </DndContext>
  );
}
