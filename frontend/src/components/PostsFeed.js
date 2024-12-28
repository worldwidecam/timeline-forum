import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function PostsFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/posts?page=${page}&sort=${sortBy}`);
      setPosts(response.data.posts);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, sortBy]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleUpvote = async (postId) => {
    if (!user) return;
    try {
      await axios.post(`http://localhost:5000/api/post/${postId}/upvote`);
      fetchPosts();
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handlePromoteVote = async (postId) => {
    if (!user) return;
    try {
      await axios.post(`http://localhost:5000/api/post/${postId}/promote-vote`);
      fetchPosts();
    } catch (error) {
      console.error('Error voting for promotion:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Today's Headlines
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="popular">Popular</MenuItem>
              <MenuItem value="promoted">Trending</MenuItem>
            </Select>
          </FormControl>
          {user && (
            <Button
              component={Link}
              to="/create-post"
              variant="contained"
              color="primary"
            >
              Create Post
            </Button>
          )}
        </Box>
      </Box>

      <Stack spacing={3}>
        {posts.map((post) => (
          <Card key={post.id} sx={{ position: 'relative' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={post.author.avatar_url} sx={{ mr: 1 }}>
                  {post.author.username[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {post.author.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Chip
                  component={Link}
                  to={`/timeline/${post.timeline.id}`}
                  label={`#${post.timeline.name}`}
                  color="primary"
                  size="small"
                  sx={{ ml: 'auto' }}
                  clickable
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                {post.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>

              {post.url && (
                <Box
                  component="a"
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    mb: 2,
                    textDecoration: 'none',
                    color: 'inherit',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  {post.url_image && (
                    <Box
                      component="img"
                      src={post.url_image}
                      alt=""
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {post.url_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.url_description}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  size="small"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handleUpvote(post.id)}
                  color={post.upvoted ? 'primary' : 'inherit'}
                >
                  {post.upvotes}
                </Button>
                <Button
                  size="small"
                  startIcon={<CommentIcon />}
                  component={Link}
                  to={`/post/${post.id}`}
                  color="inherit"
                >
                  {post.comment_count}
                </Button>
                <Button
                  size="small"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => handlePromoteVote(post.id)}
                  color="inherit"
                  sx={{ ml: 'auto' }}
                >
                  Promote to Timeline
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default PostsFeed;
