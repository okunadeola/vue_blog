/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouter, createWebHistory } from 'vue-router'

import PostComponent from '../views/PostComp.vue'
import PostDetailComponent from '../views/PostDetailComp.vue'

import DashboardComponent from '../views/dashboard/DashboardComp.vue'
import AdminDashboardComponent from '../views/dashboard/AdminDashboardComp.vue'
import AdminPostComponent from '../views/dashboard/AdminPostComp.vue'
import AdminUserComponent from '../views/dashboard/AdminUserComp.vue'
import AdminCommentsComponent from '../views/dashboard/AdminCommentsComp.vue'
import CreatePostComponent from '../views/dashboard/CreatePostComp.vue'

import LoginComp from '@/views/LoginComp.vue'
import RegisterComp from '@/views/RegisterComp.vue'
import SearchComp from '@/views/SearchComp.vue'
import { useAuthStore } from '@/stores/auth'

const adminGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  const user = authStore.currentUser

  if (user && user.isAdmin) {
    next()
  } else {
    next('/home') // Redirect non-admins to home
  }
}

const routes = [
  {
    path: '/home',
    name: 'home',
    component: PostComponent,
  },
  {
    path: '/postdetail/:slug',
    name: 'postdetail',
    component: PostDetailComponent,
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: LoginComp,
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: RegisterComp,
  },
  {
    path: '/search',
    name: 'search',
    component: SearchComp,
  },
  {
    path: '/admin',
    component: DashboardComponent,
    beforeEnter: adminGuard,
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'posts',
        name: 'admin-posts',
        component: AdminPostComponent,
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUserComponent,
      },
      {
        path: 'comments',
        name: 'admin-comments',
        component: AdminCommentsComponent,
      },
      {
        path: 'create/:id',
        name: 'admin-create',
        component: CreatePostComponent,
      },
    ],
  },
  {
    path: '/',
    redirect: '/home',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
