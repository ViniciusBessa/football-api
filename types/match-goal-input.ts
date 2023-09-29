export interface CreateMatchGoalInput {
  matchId: number;
  teamId: number;
  goalscorerId: number;
  assistantId: number;
  isOwnGoal: boolean;
  goalTimeStamp: Date;
}

export interface UpdateMatchGoalInput {
  matchId?: number;
  teamId?: number;
  goalscorerId?: number;
  assistantId?: number;
  isOwnGoal?: boolean;
  goalTimeStamp?: Date;
}

export interface DeleteMatchGoalInput {
  id: number;
}
