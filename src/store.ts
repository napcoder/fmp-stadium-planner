// Simple state store for stadium planner (observer pattern)
import { EnhancedStadium } from './stadium';

export type State = {
  currentStadium: EnhancedStadium;
  plannedStadium: EnhancedStadium | null;
};

type Listener = (state: State, prevState: State) => void;

class Store {
  private state: State;
  private listeners: Listener[] = [];

  constructor(initialState: State) {
    this.state = initialState;
  }

  getState(): State {
    return this.state;
  }

  setState(partial: Partial<State>) {
    const prevState = this.state;
    const newState = { ...this.state, ...partial };
    if (!this.isChanged(newState, prevState)) {
      return; // No relevant changes
    }
    this.state = newState;
    this.notify(newState,prevState);
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    // Call immediately with current state
    listener(this.state, this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private isChanged(newState: State, prevState: State): boolean {
    return (newState.currentStadium !== prevState.currentStadium && prevState.currentStadium.isDifferentLayout(newState.currentStadium)) ||
           (newState.plannedStadium !== prevState.plannedStadium && (newState.plannedStadium === null || prevState.plannedStadium === null || prevState.plannedStadium.isDifferentLayout(newState.plannedStadium)));
  }

  private notify(newState: State, prevState: State) {
    for (const l of this.listeners) l(newState, prevState);
  }
}

export default Store;
