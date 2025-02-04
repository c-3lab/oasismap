import { HappinessKey } from '@/types/happiness-key'
import { QuestionTitles } from '@/types/question-titles'

export const PROFILE_TYPE = {
  GENERAL: 'general',
  ADMIN: 'admin',
}

export const ERROR_TYPE = {
  UNAUTHORIZED: 'Unauthorized',
  REFRESH_ACCESS_TOKEN_ERROR: 'RefreshAccessTokenError',
}

export const HAPPINESS_KEYS: HappinessKey[] = [
  'happiness1',
  'happiness2',
  'happiness3',
  'happiness4',
  'happiness5',
  'happiness6',
]

export const questionTitles: QuestionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export const HAPPINESS_ALL_BAR_GRAPH_YAXIS_WIDTH = 125
