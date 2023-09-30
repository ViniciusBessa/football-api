export interface CreateMatchGoalInput {
  matchId: number;
  teamId: number;
  goalscorerId: number;
  assistantId: number;
  isOwnGoal: boolean;
  goalTimeStamp: Date;
}

export interface UpdateMatchGoalInput {
  id: number;
  matchId?: number;
  teamId?: number;
  goalscorerId?: number;
  assistantId?: number;
  isOwnGoal?: boolean;
  goalTimeStamp?: Date;
}

export interface GetMatchGoalInput {
  id: number;
}
