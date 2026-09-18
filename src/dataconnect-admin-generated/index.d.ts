import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Block_Key {
  blockerId: UUIDString;
  blockedId: UUIDString;
  __typename?: 'Block_Key';
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreatePostData {
  post_insert: Post_Key;
}

export interface CreatePostVariables {
  mediaUrl: string;
  caption: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  username: string;
  email: string;
  bio?: string | null;
}

export interface DeletePostData {
  post_delete?: Post_Key | null;
}

export interface DeletePostVariables {
  id: UUIDString;
}

export interface Follow_Key {
  followerId: UUIDString;
  followedId: UUIDString;
  __typename?: 'Follow_Key';
}

export interface Like_Key {
  id: UUIDString;
  __typename?: 'Like_Key';
}

export interface ListPostsData {
  posts: ({
    id: UUIDString;
    mediaUrl: string;
    caption: string;
    author: {
      username: string;
      profileImageUrl?: string | null;
    };
  } & Post_Key)[];
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePost' Mutation. Allow users to execute without passing in DataConnect. */
export function createPost(dc: DataConnect, vars: CreatePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePostData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePost' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPost(vars: CreatePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePostData>>;

/** Generated Node Admin SDK operation action function for the 'DeletePost' Mutation. Allow users to execute without passing in DataConnect. */
export function deletePost(dc: DataConnect, vars: DeletePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeletePostData>>;
/** Generated Node Admin SDK operation action function for the 'DeletePost' Mutation. Allow users to pass in custom DataConnect instances. */
export function deletePost(vars: DeletePostVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeletePostData>>;

/** Generated Node Admin SDK operation action function for the 'ListPosts' Query. Allow users to execute without passing in DataConnect. */
export function listPosts(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPostsData>>;
/** Generated Node Admin SDK operation action function for the 'ListPosts' Query. Allow users to pass in custom DataConnect instances. */
export function listPosts(options?: OperationOptions): Promise<ExecuteOperationResponse<ListPostsData>>;

