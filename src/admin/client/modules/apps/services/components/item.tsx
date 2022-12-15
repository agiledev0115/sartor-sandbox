import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { CheckCircle } from "@material-ui/icons"
import React, { FC } from "react"
import { Link } from "react-router-dom"

// import style from "./style.module.sass"

const styles = {
  card: {
    width: 280,
    marginBottom: 15,
    marginRight: 15,
  },
  textContainer: {
    paddingBottom: 0,
  },
  title: {
    color: "#212121",
    fontSize: "15px",
    lineHeight: "18px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#616161",
    fontSize: "13px",
    lineHeight: "16px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: 5,
  },
  link: {
    textDecoration: "none",
  },
}

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
})

interface props {
  path: string
  coverUrl: string
  title: string
  developer?: string
  enabled?: boolean
}

const Item: FC<props> = (props: props) => {
  const { path, coverUrl, title, developer, enabled } = props
  const classes = useStyles()
  return (
    <Link to={path} style={styles.link}>
      {/**<Card
        style={styles.card}
        containerStyle={styles.textContainer}
        className={style.card}
      > */}
      {/**<CardMedia
          className={style.servicesCover}/> */}
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt={title}
            height="140"
            image={coverUrl}
            title={title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {/**titleStyle={styles.title}
          subtitleStyle={styles.subtitle} */}
              {developer}
              {enabled && (
                <CheckCircle style={{ color: "#FF9900", float: "right" }} />
              )}
            </Typography>
          </CardContent>
        </CardActionArea>
        {/**
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions> */}
      </Card>
    </Link>
  )
}

export default Item
