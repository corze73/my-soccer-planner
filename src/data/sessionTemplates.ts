import { SessionTemplate } from '../types';

export const sessionTemplates: SessionTemplate[] = [
  {
    id: 'youth-basic',
    name: 'Youth Basic Training',
    description: 'Basic training session for youth players focusing on fundamentals',
    duration: 90,
    category: 'Youth',
    activities: [
      {
        id: '1',
        name: 'Dynamic Warm-up',
        duration: 15,
        description: 'Jogging, dynamic stretches, and activation exercises',
        category: 'warmup'
      },
      {
        id: '2',
        name: 'Ball Mastery',
        duration: 20,
        description: 'Individual ball control and first touch exercises',
        category: 'technical'
      },
      {
        id: '3',
        name: 'Passing & Receiving',
        duration: 25,
        description: 'Partner passing exercises with increasing difficulty',
        category: 'technical'
      },
      {
        id: '4',
        name: 'Small-sided Games',
        duration: 20,
        description: '4v4 games focusing on quick decision making',
        category: 'tactical'
      },
      {
        id: '5',
        name: 'Cool Down',
        duration: 10,
        description: 'Light jogging and static stretching',
        category: 'cooldown'
      }
    ]
  },
  {
    id: 'advanced-tactical',
    name: 'Advanced Tactical Session',
    description: 'Intensive tactical training for advanced players',
    duration: 120,
    category: 'Advanced',
    activities: [
      {
        id: '1',
        name: 'Activation Warm-up',
        duration: 15,
        description: 'Dynamic warm-up with ball work',
        category: 'warmup'
      },
      {
        id: '2',
        name: 'Tactical Shape Work',
        duration: 30,
        description: 'Formation work and positional play',
        category: 'tactical'
      },
      {
        id: '3',
        name: 'Set Piece Practice',
        duration: 25,
        description: 'Corners, free kicks, and throw-ins',
        category: 'tactical'
      },
      {
        id: '4',
        name: '11v11 Scrimmage',
        duration: 40,
        description: 'Full-sided game applying tactical concepts',
        category: 'tactical'
      },
      {
        id: '5',
        name: 'Recovery',
        duration: 10,
        description: 'Cool down and stretching routine',
        category: 'cooldown'
      }
    ]
  }
];