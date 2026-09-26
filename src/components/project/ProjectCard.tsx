import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, CalendarClockIcon, MapPinIcon } from 'lucide-react';
import { Progress } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Panel, SpecLabel } from '../smpro/Primitives';
import { Project } from '../../types';
import { currency } from '../../utils/format';
import { memberName } from '../../data/organization';

/**
 * A project reads as a jobsite record: photograph of the actual build, the
 * drawing-style number block, and the two figures a builder checks first —
 * procurement progress and material spend against budget.
 */
export function ProjectCard({ project }: {project: Project;}) {
  const navigate = useNavigate();
  const health =
  project.status === 'At Risk' ?
  { tone: 'text-danger-500', label: 'At risk' } :
  project.openIssues > 2 ?
  { tone: 'text-caution-500', label: 'Watch' } :
  { tone: 'text-positive-500', label: 'On track' };

  return (
    <Panel as="article" className="flex h-full flex-col overflow-hidden">
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        className="flex h-full w-full flex-col text-left">
        
        <div className="relative h-40 w-full shrink-0 overflow-hidden bg-ink-100">
          <img
            src={project.image}
            alt={`${project.name} construction progress`}
            className="h-full w-full object-cover" />
          
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink-900/80 to-transparent px-3 pb-2.5 pt-8">
            <span className="measure text-[10.5px] font-bold text-white/85">{project.number}</span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="display-tight truncate text-[15.5px] font-bold text-ink-900">{project.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-ink-400">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                {project.address}
              </p>
            </div>
            <Avatar name={memberName(project.managerId)} size="sm" />
          </div>

          {/* Procurement completion is the number that drives everything else. */}
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <SpecLabel>Procurement complete</SpecLabel>
              <span className="measure text-[15px] font-bold text-ink-900">{project.procurement}%</span>
            </div>
            <Progress value={project.procurement} className="mt-1.5" />
          </div>

          <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-ink-100 pt-3.5">
            <div className="min-w-0">
              <dt className="spec-label">Material spend</dt>
              <dd className="measure mt-0.5 truncate text-[13.5px] font-bold text-ink-900">
                {currency(project.spend, { compact: true })}
                <span className="ml-1 text-[10.5px] font-medium text-ink-400">
                  / {currency(project.value, { compact: true })}
                </span>
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="spec-label">Next milestone</dt>
              <dd className="mt-0.5 flex items-center gap-1 text-[12.5px] font-semibold text-ink-800">
                <CalendarClockIcon className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span className="truncate">{project.nextMilestoneDate}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className={`spine flex items-center gap-3 border-t border-ink-100 bg-ink-50/70 px-4 py-2 ${health.tone}`}>
          <span className="spec-label text-current">{health.label}</span>
          <span className="ml-auto flex items-center gap-3 text-[11.5px] font-semibold">
            {project.pendingActions > 0 &&
            <span className="text-brand-600">{project.pendingActions} pending</span>
            }
            {project.openIssues > 0 &&
            <span className="flex items-center gap-1 text-ink-500">
                <AlertTriangleIcon className="h-3.5 w-3.5" />
                {project.openIssues}
              </span>
            }
          </span>
        </div>
      </button>
    </Panel>);

}

export function ProjectMiniCard({ project }: {project: Project;}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-[236px] shrink-0 overflow-hidden rounded-[4px] border border-ink-100 bg-white text-left transition-colors duration-150 ease-smooth hover:border-ink-200">
      
      <div className="relative h-24 overflow-hidden bg-ink-100">
        <img src={project.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <p className="truncate text-[13.5px] font-bold text-ink-900">{project.name}</p>
        <p className="measure mt-0.5 truncate text-[11px] text-ink-400">{project.number}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <SpecLabel>Procurement</SpecLabel>
          <span className="measure text-[12px] font-bold text-ink-800">{project.procurement}%</span>
        </div>
        <Progress value={project.procurement} className="mt-1" />
      </div>
    </button>);

}