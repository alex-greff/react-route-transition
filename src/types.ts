import * as History from 'history';

export type TPathOrPaths = History.Path | History.Path[] | undefined;

export interface ITransitionCbData {
  from: string;
  to: string;
}

export interface ITransitionListener {
  path?: TPathOrPaths;
  from?: TPathOrPaths;
  to?: TPathOrPaths;
  onEnter?: (data: ITransitionCbData) => Promise<void>;
  onLeave?: (data: ITransitionCbData) => Promise<void>;
}

export interface ITransitionOptions {
  handlers: ITransitionListener[];
}

// export interface IHistory {
//   push: (path: History.Path, state: History.LocationState)
// }

export type TPush = (path: History.Path, state: History.LocationState) => void;
export type TLocation = { pathname: History.Path };
// export type TLocation<S = History.LocationState> = History.Location<S>;
