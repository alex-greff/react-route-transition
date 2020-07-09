import { TPathOrPaths } from './types';
import { useContext, useCallback } from 'react';
import * as History from 'history';
import { TransitionContext } from './TransitionProvider';
import { matchPath } from "react-router";

function arrarizePath(pathOrPaths: TPathOrPaths) {
  return typeof pathOrPaths === 'string' ? [pathOrPaths] : pathOrPaths ?? [];
}

function removeSearch(path: History.Path) {
  return path.split('?')[0];
}

function removeSearchArray(paths: History.Path[]) {
  return paths.map(removeSearch);
}

function hasPath(pathOrPaths: TPathOrPaths, path: History.Path) {
  const pathsArray = removeSearchArray(arrarizePath(pathOrPaths));

  return pathsArray.some((potentialPath) => {
    return matchPath(path, potentialPath);
  });
}

export default function () {
  const { listeners, location, push: wrappedPush } = useContext(
    TransitionContext
  );

  const push = useCallback(
    async (path: History.Path, state?: History.LocationState) => {
      if (path !== location.pathname) {
        await Promise.all(
          listeners
            .filter(
              (listener) =>
                hasPath(listener.path, location.pathname) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter((listener) => !!listener.onLeave)
            .map((listener) => listener.onLeave!())
        );
      }

      wrappedPush(path, state);

      if (path !== location.pathname) {
        await Promise.all(
          listeners
            .filter(
              (listener) =>
                hasPath(listener.path, path) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter((listener) => !!listener.onEnter)
            .map((listener) => listener.onEnter!())
        );
      }
    },
    []
  );

  return {
    push,
  };
}
