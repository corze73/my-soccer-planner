import { Formation } from '../types';
import { positions } from './positions';

export const formations: Formation[] = [
  {
    id: '4-4-2',
    name: '4-4-2',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 35, y: 20, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 35, y: 40, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 35, y: 60, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 35, y: 80, position: positions.find(p => p.id === 'rb')! },
      { id: '6', x: 60, y: 20, position: positions.find(p => p.id === 'lm')! },
      { id: '7', x: 60, y: 40, position: positions.find(p => p.id === 'cm')! },
      { id: '8', x: 60, y: 60, position: positions.find(p => p.id === 'cm')! },
      { id: '9', x: 60, y: 80, position: positions.find(p => p.id === 'rm')! },
      { id: '10', x: 80, y: 40, position: positions.find(p => p.id === 'st')! },
      { id: '11', x: 80, y: 60, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '4-3-3',
    name: '4-3-3',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 35, y: 25, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 35, y: 40, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 35, y: 60, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 35, y: 75, position: positions.find(p => p.id === 'rb')! },
      { id: '6', x: 55, y: 30, position: positions.find(p => p.id === 'cm')! },
      { id: '7', x: 55, y: 50, position: positions.find(p => p.id === 'cm')! },
      { id: '8', x: 55, y: 70, position: positions.find(p => p.id === 'cm')! },
      { id: '9', x: 80, y: 25, position: positions.find(p => p.id === 'lw')! },
      { id: '10', x: 80, y: 50, position: positions.find(p => p.id === 'st')! },
      { id: '11', x: 80, y: 75, position: positions.find(p => p.id === 'rw')! },
    ]
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 30, position: positions.find(p => p.id === 'cb')! },
      { id: '3', x: 30, y: 50, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 70, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 50, y: 15, position: positions.find(p => p.id === 'lm')! },
      { id: '6', x: 50, y: 35, position: positions.find(p => p.id === 'cm')! },
      { id: '7', x: 50, y: 50, position: positions.find(p => p.id === 'cdm')! },
      { id: '8', x: 50, y: 65, position: positions.find(p => p.id === 'cm')! },
      { id: '9', x: 50, y: 85, position: positions.find(p => p.id === 'rm')! },
      { id: '10', x: 75, y: 40, position: positions.find(p => p.id === 'st')! },
      { id: '11', x: 75, y: 60, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 20, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 30, y: 40, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 60, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 30, y: 80, position: positions.find(p => p.id === 'rb')! },
      { id: '6', x: 50, y: 35, position: positions.find(p => p.id === 'cdm')! },
      { id: '7', x: 50, y: 65, position: positions.find(p => p.id === 'cdm')! },
      { id: '8', x: 65, y: 25, position: positions.find(p => p.id === 'lw')! },
      { id: '9', x: 65, y: 50, position: positions.find(p => p.id === 'cam')! },
      { id: '10', x: 65, y: 75, position: positions.find(p => p.id === 'rw')! },
      { id: '11', x: 80, y: 50, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '4-1-4-1',
    name: '4-1-4-1',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 20, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 30, y: 40, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 60, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 30, y: 80, position: positions.find(p => p.id === 'rb')! },
      { id: '6', x: 45, y: 50, position: positions.find(p => p.id === 'cdm')! },
      { id: '7', x: 60, y: 25, position: positions.find(p => p.id === 'lm')! },
      { id: '8', x: 60, y: 40, position: positions.find(p => p.id === 'cm')! },
      { id: '9', x: 60, y: 60, position: positions.find(p => p.id === 'cm')! },
      { id: '10', x: 60, y: 75, position: positions.find(p => p.id === 'rm')! },
      { id: '11', x: 80, y: 50, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '5-3-2',
    name: '5-3-2',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 15, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 30, y: 35, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 50, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 30, y: 65, position: positions.find(p => p.id === 'cb')! },
      { id: '6', x: 30, y: 85, position: positions.find(p => p.id === 'rb')! },
      { id: '7', x: 55, y: 35, position: positions.find(p => p.id === 'cm')! },
      { id: '8', x: 55, y: 50, position: positions.find(p => p.id === 'cm')! },
      { id: '9', x: 55, y: 65, position: positions.find(p => p.id === 'cm')! },
      { id: '10', x: 75, y: 40, position: positions.find(p => p.id === 'st')! },
      { id: '11', x: 75, y: 60, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '4-5-1',
    name: '4-5-1',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 20, position: positions.find(p => p.id === 'lb')! },
      { id: '3', x: 30, y: 40, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 60, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 30, y: 80, position: positions.find(p => p.id === 'rb')! },
      { id: '6', x: 55, y: 20, position: positions.find(p => p.id === 'lm')! },
      { id: '7', x: 55, y: 35, position: positions.find(p => p.id === 'cm')! },
      { id: '8', x: 55, y: 50, position: positions.find(p => p.id === 'cdm')! },
      { id: '9', x: 55, y: 65, position: positions.find(p => p.id === 'cm')! },
      { id: '10', x: 55, y: 80, position: positions.find(p => p.id === 'rm')! },
      { id: '11', x: 80, y: 50, position: positions.find(p => p.id === 'st')! },
    ]
  },
  {
    id: '3-4-3',
    name: '3-4-3',
    positions: [
      { id: '1', x: 15, y: 50, position: positions.find(p => p.id === 'gk')! },
      { id: '2', x: 30, y: 30, position: positions.find(p => p.id === 'cb')! },
      { id: '3', x: 30, y: 50, position: positions.find(p => p.id === 'cb')! },
      { id: '4', x: 30, y: 70, position: positions.find(p => p.id === 'cb')! },
      { id: '5', x: 50, y: 25, position: positions.find(p => p.id === 'lm')! },
      { id: '6', x: 50, y: 45, position: positions.find(p => p.id === 'cm')! },
      { id: '7', x: 50, y: 55, position: positions.find(p => p.id === 'cm')! },
      { id: '8', x: 50, y: 75, position: positions.find(p => p.id === 'rm')! },
      { id: '9', x: 75, y: 30, position: positions.find(p => p.id === 'lw')! },
      { id: '10', x: 75, y: 50, position: positions.find(p => p.id === 'st')! },
      { id: '11', x: 75, y: 70, position: positions.find(p => p.id === 'rw')! },
    ]
  }
];