import { createRouter, createWebHashHistory } from 'vue-router';

import HomePage from './views/home';

import Snapshot from './views/snapshot';
import SnapshotPage from './views/snapshot';
import SnapshotDetail from './views/snapshot/detail';

import AccountDetail from './views/account/detail';
import Accounts from './views/account';

import Token from './views/token';
import TokenDetail from './views/token/detail';

import Sbp from './views/sbp';
import SbpDetail from './views/sbp/detail';

import TxDetail from './views/tx/detail';

import Setting from './views/setting';

const routes = [
  {
    path: '/sbp',
    component: Sbp
  },
  {
    path: '/sbp/:name',
    component: SbpDetail
  },
  {
    path: '/token/:tid',
    component: TokenDetail
  },
  {
    path: '/tokens',
    component: Token
  },
  {
    path: '/account/:address',
    component: AccountDetail
  },
  {
    path: '/accounts',
    component: Accounts
  },
  {
    path: '/tx/:hash',
    component: TxDetail
  },
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/snapshots',
    component: Snapshot
  },
  {
    path: '/snapshot/:heightorhash',
    component: SnapshotDetail
  },
  {
    path: '/snapshot/page/:page',
    component: SnapshotPage
  },
  {
    path: '/settings',
    component: Setting
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
