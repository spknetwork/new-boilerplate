import { gql } from "@apollo/client";

export const GET_TRENDING_FEED = gql`
  query trendingFeed($tags: [String!]) {
    trendingFeed(feedOptions: { byTag: { _in: $tags } }) {
      items {
        title
        ... on HivePost {
          community
        }
        body
        permlink
        author {
          username
        }
        json_metadata {
          image
          app
        }
        created_at
        updated_at
        stats {
          num_votes
          num_comments
          total_hive_reward
        }
      }
    }
  }
`;

export const GET_SOCIAL_FEED = gql`
  query socialFeed($tags: [String!]) {
    socialFeed(feedOptions: { byTag: { _in: $tags } }) {
      items {
        title
        ... on HivePost {
          community
        }
        body
        permlink
        author {
          username
          profile
        }
        json_metadata {
          image
          app
        }
        created_at
        updated_at
        stats {
          num_votes
          num_comments
          total_hive_reward
        }
      }
    }
  }
`;

export const GET_PROFILE = gql`
  query profile($id: String) {
    profile(id: $id) {
      ... on HiveProfile {
        id
        username
        name
        about
        images {
          avatar
          cover
        }
        json_metadata
        website
        location
        did
        src
      }
    }
  }
`;
