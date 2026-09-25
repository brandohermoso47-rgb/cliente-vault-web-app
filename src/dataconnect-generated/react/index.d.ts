import { CreateUserData, CreateUserVariables, CreatePostData, CreatePostVariables, DeletePostData, DeletePostVariables, ListPostsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useCreatePost(options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;
export function useCreatePost(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;

export function useDeletePost(options?: useDataConnectMutationOptions<DeletePostData, FirebaseError, DeletePostVariables>): UseDataConnectMutationResult<DeletePostData, DeletePostVariables>;
export function useDeletePost(dc: DataConnect, options?: useDataConnectMutationOptions<DeletePostData, FirebaseError, DeletePostVariables>): UseDataConnectMutationResult<DeletePostData, DeletePostVariables>;

export function useListPosts(options?: useDataConnectQueryOptions<ListPostsData>): UseDataConnectQueryResult<ListPostsData, undefined>;
export function useListPosts(dc: DataConnect, options?: useDataConnectQueryOptions<ListPostsData>): UseDataConnectQueryResult<ListPostsData, undefined>;
