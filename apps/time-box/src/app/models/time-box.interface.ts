export interface ITimeBox {
  startTime: Date;
  endTime: Date;
  timeBlocks: ITimeBlock[];
}

export interface ITimeBlock {
  position: number;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  description: string;
}
