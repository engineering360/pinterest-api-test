import * as React from 'react'
import { Link } from 'react-router-dom'
import gql from "graphql-tag"
import { graphql, compose, Mutation } from 'react-apollo'
import { toggleSavePost, usersSavedPosts } from '../queries'
import Masonry from 'react-masonry-component'
import grayStar from '../images/iconmonstr-star-1-gray.svg'
import greenStar from '../images/iconmonstr-star-1-green.svg'
import placeholderPicture from '../images/iconmonstr-picture-1.svg'

class SavedPosts extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }
    this.showPlaceholder = this.showPlaceholder.bind(this)
  }

  showPlaceholder(event) {
    event.target.src = placeholderPicture
  }

  SavedPosts() {
    if (this.props.usersSavedPosts.loading || this.props.signedInUser.loading) return (
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      )
    if (this.props.usersSavedPosts.error || this.props.signedInUser.error) return <div>There was an error loading this content. Please try again.</div>
    if (this.props.usersSavedPosts.usersSavedPosts) return (
      this.props.usersSavedPosts.usersSavedPosts.map((post) => {

        // Check if signed in user saved this post
        let didUserSavePost = -1;
        this.props.signedInUser.signedInUser 
          ? didUserSavePost = post.savedBy.findIndex(oid => String(oid.id) === this.props.signedInUser.signedInUser.id)
          : null

        return (
          <div key={post.id} className="masonry--grid-item">
            <Link to={`/post/${post.id}`}><img src={post.url} alt={post.title} onError={this.showPlaceholder} className="masonry--grid-item-photo"/></Link>
            <div>
              <p className="masonry--grid-item-from">From <Link to={`/profile/${post.createdBy.id}`}>{post.createdBy.username}</Link></p>
              { this.props.signedInUser.signedInUser 
                ? (<Mutation 
                    mutation={toggleSavePost}
                    refetchQueries={[{ query: usersSavedPosts, variables: { id: this.props.signedInUser.signedInUser.id } }]}
                    >
                    {(toggleSavePost) => (
                      <button onClick={() => {
                        toggleSavePost({
                          variables: { id: post.id }
                        })
                      }}
                        className="masonry--grid-item-star-button"
                      >
                      { didUserSavePost 
                        ? <div><span className="masonry--grid-item-star-button-count">{post.savedBy.length}</span><img src={grayStar} alt="gray star" /></div>
                        : <div><span className="masonry--grid-item-star-button-count">{post.savedBy.length}</span><img src={greenStar} alt="green star" /></div>
                      }
                      </button>
                    )}
                  </Mutation>)
                : <div><span className="masonry--grid-item-star-button-count-signedout">{post.savedBy.length}</span><img src={grayStar} alt="gray star" className="masonry--grid-item-star"/></div>
              }
            </div>
          </div>
        )
      })
    )
  }

  render() {
    return (
      <Masonry className="masonry--grid">
        {this.SavedPosts()}
      </Masonry>
    )
  }

}

export default compose(
  graphql(gql`
    query usersSavedPosts($id: String!) {
      usersSavedPosts(id: $id) {
        id
        title
        url
        dateCreated
        createdBy {
          id
          username
          displayName
          photo
        }
        savedBy {
          id
          username
          displayName
          photo
        }
      }
    }
  `, {name: "usersSavedPosts", options: (props) => ({ variables: { id: props.userData.id }})}),
  graphql(gql`
  {
    signedInUser {
      id
      twitterId
      username
      displayName
      photo
    }
  }
  `, {name: "signedInUser"})
)(SavedPosts)
