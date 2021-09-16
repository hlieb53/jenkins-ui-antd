﻿export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
    ],
  },
  {
    path: '/analysis',
    name: 'analysis',
    icon: 'smile',
    component: './Analysis',
  },
  {
    path: '/system',
    name: 'system',
    icon: 'crown',
    routes: [
      {
        path: '/system',
        redirect: '/system/user',
      },
      {
        path: '/system/user',
        name: 'user',
        icon: 'smile',
        access: 'user',
        component: './system/User',
      },
      {
        path: '/system/role',
        name: 'role',
        icon: 'smile',
        access: 'role',
        component: './system/Role',
      },
      {
        path: '/system/permission',
        name: 'permission',
        icon: 'smile',
        component: './system/Permission',
      },
      {
        path: '/system/org',
        name: 'org',
        icon: 'smile',
        access: 'organization',
        component: './system/Org',
      },
      {
        path: '/system/open-api',
        name: 'open-api',
        icon: 'smile',
        component: './system/OpenAPI',
      },
      {
        path: '/system/tenant',
        name: 'tenant',
        icon: 'smile',
        component: './system/Tenant',
      },
      {
        path: '/system/datasource',
        name: 'datasource',
        icon: 'smile',
        component: './system/DataSource',
      },
    ],
  },
  {
    path: '/device',
    name: 'device',
    icon: 'crown',
    routes: [
      {
        path: '/device',
        redirect: '/device/product',
      },
      {
        path: '/device/product',
        name: 'product',
        icon: 'smile',
        component: './device/Product',
      },
      {
        path: '/device/category',
        name: 'category',
        icon: 'smile',
        component: './device/Category',
      },
      {
        hideInMenu: true,
        path: '/device/product/detail/:id',
        name: 'product-detail',
        icon: 'smile',
        component: './device/Product/Detail',
      },
      {
        path: '/device/instance',
        name: 'instance',
        icon: 'smile',
        component: './device/Instance',
      },
      {
        hideInMenu: true,
        path: '/device/instance/detail/:id',
        name: 'instance-detail',
        icon: 'smile',
        component: './device/Instance/Detail',
      },
      {
        path: '/device/command',
        name: 'command',
        icon: 'smile',
        component: './device/Command',
      },
      {
        path: '/device/firmware',
        name: 'firmware',
        icon: 'smile',
        component: './device/Firmware',
      },
      {
        path: '/device/alarm',
        name: 'alarm',
        icon: 'smile',
        component: './device/Alarm',
      },
    ],
  },
  {
    path: '/link',
    name: 'link',
    icon: 'crown',
    routes: [
      {
        path: '/link',
        redirect: '/link/certificate',
      },
      {
        path: '/link/certificate',
        name: 'certificate',
        icon: 'smile',
        component: './link/Certificate',
      },
      {
        path: '/link/gateway',
        name: 'gateway',
        icon: 'smile',
        component: './link/Gateway',
      },
      {
        path: '/link/opcua',
        name: 'opcua',
        icon: 'smile',
        component: './link/Opcua',
      },
      {
        path: '/link/protocol',
        name: 'protocol',
        icon: 'smile',
        component: './link/Protocol',
      },
      {
        path: 'link/type',
        name: 'type',
        icon: 'smile',
        component: './link/Type',
      },
    ],
  },
  {
    path: '/notice',
    name: 'notice',
    icon: 'crown',
    routes: [
      {
        path: '/notice',
        redirect: '/notice/config',
      },
      {
        path: '/notice/config',
        name: 'config',
        icon: 'smile',
        component: './notice/Config',
      },
      {
        path: '/notice/template',
        name: 'template',
        icon: 'smile',
        component: './notice/Template',
      },
    ],
  },
  {
    path: '/rule-engine',
    name: 'rule-engine',
    icon: 'crown',
    routes: [
      {
        path: '/rule-engine',
        redirect: 'rule-engine/instance',
      },
      {
        path: '/rule-engine/instance',
        name: 'instance',
        icon: 'smile',
        component: './rule-engine/Instance',
      },
      {
        path: '/rule-engine/sqlrule',
        name: 'sqlrule',
        icon: 'smile',
        component: './rule-engine/SQLRule',
      },
      {
        path: '/rule-engine/scene',
        name: 'scene',
        icon: 'smile',
        component: './rule-engine/Scene',
      },
    ],
  },
  {
    path: '/log',
    name: 'log',
    icon: 'crown',
    routes: [
      {
        path: '/log',
        redirect: '/log/access',
      },
      {
        path: '/log/access',
        name: 'access',
        icon: 'smile',
        component: './log/Access',
      },
      {
        path: '/log/system',
        name: 'system',
        icon: 'smile',
        component: './log/System',
      },
    ],
  },
  {
    path: '/',
    redirect: '/analysis',
  },
  {
    component: './404',
  },
];
