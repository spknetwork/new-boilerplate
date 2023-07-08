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
