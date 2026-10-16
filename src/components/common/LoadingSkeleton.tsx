/**
 * LoadingSkeleton - Reusable skeleton placeholders for content loading states.
 * Replaces blank screens during async data fetching.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  radius?: string;
}

export function Skeleton({
  className = '',
  height = 16,
  width = '100%',
  radius = '4px',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${radius} ${className}`}
      style={{ height, width }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: number | string;
  lineWidth?: number | string;
}

export function SkeletonText({
  lines = 3,
  className = '',
  lineHeight = 1.2,
  lineWidth = '100%',
}: SkeletonTextProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? '60%' : lineWidth}
          className="mb-2"
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton height={40} width={40} className="rounded-full" />
        <div className="flex-1">
          <Skeleton height={16} width="40%" className="mb-2" />
          <Skeleton height={14} width="100%" className="mb-1" />
          <Skeleton height={14} width="60%" />
        </div>
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}

interface SkeletonListProps {
  itemCount?: number;
  className?: string;
}

export function SkeletonList({
  itemCount = 5,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={className}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 animate-pulse">
          <Skeleton height={48} width={48} className="rounded-full" />
          <div className="flex-1">
            <Skeleton height={16} width="50%" className="mb-2" />
            <Skeleton height={14} width="80%" className="mb-1" />
            <Skeleton height={14} width="40%" />
          </div>
          <Skeleton height={16} width="20%" className="ml-2" />
        </div>
      ))}
    </div>
  );
}
