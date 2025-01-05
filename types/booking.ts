export interface TimeSlot {
    start: string;
    end: string;
    isAvailable: boolean;
}

export interface DaySchedule {
    date: Date;
    slots: TimeSlot[];
}
