import * as d from '../../declarations';
import { initClient } from './init-client';
import { isInitialDevServerLoad } from '../util';


declare const window: d.DevClientWindow;

const ctx: d.DevServerClientContext = {
  isInitialDevServerLoad: isInitialDevServerLoad(window.location.pathname)
};

initClient(window.$devServer, ctx, window, document);
