import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import type * as React from 'react'
import { useNavigate } from 'react-router'

import type { BlogPostWithAuthorType } from '@dx3/models-shared'

import { useStrings } from '../i18n'

dayjs.extend(localizedFormat)

type BlogPostCardProps = {
  post: BlogPostWithAuthorType
}

export const BlogPostCardComponent: React.FC<BlogPostCardProps> = ({ post }) => {
  const navigate = useNavigate()
  const strings = useStrings(['BLOG_READ_MORE', 'BLOG_READING_TIME_MIN'])

  const excerpt =
    post.excerpt ?? post.content.slice(0, 200) + (post.content.length > 200 ? '...' : '')
  const publishedDate = post.publishedAt ? dayjs(post.publishedAt).format('L') : ''

  const handleClick = () => {
    navigate(`/blog/${post.slug}`)
  }

  return (
    <Card
      onClick={handleClick}
      sx={{
        '&:hover': {
          boxShadow: 4,
        },
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
    >
      <CardContent sx={{ paddingBottom: 2, paddingTop: 2 }}>
        <Typography
          color="primary"
          gutterBottom
          variant="h6"
        >
          {post.title}
        </Typography>
        <Typography
          color="textSecondary"
          gutterBottom
          variant="body2"
        >
          {post.authorDisplayName} · {publishedDate}
          {post.readingTimeMinutes > 0 &&
            ` · ${post.readingTimeMinutes} ${strings.BLOG_READING_TIME_MIN}`}
        </Typography>
        <Typography
          color="textSecondary"
          gutterBottom
          variant="body1"
        >
          {excerpt}
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {post.categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              size="small"
              variant="outlined"
            />
          ))}
          {post.tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              variant="outlined"
            />
          ))}
        </div>
        <Link
          component="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          sx={{ display: 'inline-block', marginTop: 1 }}
          variant="body2"
        >
          {strings.BLOG_READ_MORE}
        </Link>
      </CardContent>
    </Card>
  )
}
