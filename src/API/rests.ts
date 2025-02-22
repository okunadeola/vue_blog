/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from './restServices'

export const getPostBySlug = async (slug: string) => {
  try {
    const res = await API.get(`/post/getposts?slug=${slug}`)

    if (res) {
      return res.data
    }
  } catch (error: any) {
    console.log(error)
  }
}
export const getRecentPost = async () => {
  try {
    const res = await API.get(`/post/getposts?limit=3`)

    if (res) {
      return res.data
    }
  } catch (error) {
    console.log(error)
  }
}

export function getPostComments(postId: string | null) {
  return API.get(`/comment/getPostComments/${postId}`)
}

export function createComment(payload: any) {
  return API.post('/comment/create', payload)
}

export function likeComment(commentId: string) {
  return API.put(`/comment/likeComment/${commentId}`, {})
}

export function deleteComment(commentId: string) {
  return API.delete(`/comment/deleteComment/${commentId}`)
}

export function getPostByQuery(searchQuery: string) {
  return API.get(`/post/getposts?${searchQuery}`)
}

export function getUsers() {
  return API.get(`/user/getusers?limit=5`)
}
export function getPosts() {
  return API.get(`/post/getposts?limit=5`)
}
export function getComments() {
  return API.get(`/comment/getcomments?limit=5`)
}

// getAllPosts, deletePost
export function getAllPosts(startIndex: any) {
  return API.get(`/post/getposts?startIndex=${startIndex}`)
}
export function deletePost(userId: any, postId: any) {
  return API.delete(`/post/deletepost/${postId}/${userId}`)
}

// under create post
// createPost, updatePost, getFeaturedPost
export function getFeaturedPost() {
  return API.get('/featured/get')
}

export function fetchPostByID(postId: any) {
  return API.get(`/post/getposts?postId=${postId}`)
}
export function createPost(formData: any) {
  return API.post(`/post/create`, formData)
}
export function updatePost(formData: any, postId: any, userId: any) {
  return API.put(`/post/updatepost/${postId}/${userId}`, formData)
}

// user
export function getAllUsers(startIndex: any) {
  return API.get<any>(`/user/getusers?startIndex=${startIndex}`)
}
export function deleteUser(userId: any) {
  return API.delete<any>(`/user/delete/${userId}`)
}

// comment
export function getAllComments(startIndex: any) {
  return API.get<any>(`/comment/getcomments?startIndex=${startIndex}`)
}
