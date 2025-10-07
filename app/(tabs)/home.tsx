import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { statusApi } from "../../services/api";
import { Status, User, Comment } from "../../types";

// ฟังก์ชันแยกสำหรับจัดการ avatar
const getAvatarSource = (user: User | null) => {
  if (user?.image) {
    return { uri: user.image };
  }
  return undefined;
};

// ฟังก์ชันปลอดภัยสำหรับดึงชื่อย่อ
const getInitials = (user: User | null) => {
  if (!user?.firstname || !user?.lastname) return "??";
  return `${user.firstname[0] || ""}${user.lastname[0] || ""}`;
};

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Status[]>([]);
  const [newPost, setNewPost] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);

  // State สำหรับ comment
  const [selectedPost, setSelectedPost] = useState<Status | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  // State สำหรับแก้ไขโพสต์
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Status | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await statusApi.getStatuses();
      if (response.data && response.data.data) {
        setPosts(response.data.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // ✅ ฟังก์ชันสร้างโพสต์ใหม่
  const createPost = async () => {
    if (!newPost.trim()) {
      Alert.alert("", "กรุณากรอกข้อความ");
      return;
    }

    setPosting(true);
    try {
      await statusApi.createStatus(newPost);
      setNewPost("");
      await loadPosts();
      Alert.alert("สำเร็จ", "โพสต์ของคุณถูกเผยแพร่แล้ว");
    } catch (error: any) {
      Alert.alert(
        "โพสต์ไม่สำเร็จ",
        error.response?.data?.message || "เกิดข้อผิดพลาด"
      );
    } finally {
      setPosting(false);
    }
  };

  const likePost = async (postId : string) => {
    try {
      const res = await statusApi.likeStatus(postId);

      const updated = res.data?.data;

      if (!updated) return;

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, ...updated } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    setCommenting(true);
    try {
      await statusApi.addComment(selectedPost._id, newComment);
      setNewComment("");
      setCommentModalVisible(false);
      await loadPosts();
      Alert.alert("Success", "Your comment has been added");
    } catch (error: any) {
      Alert.alert("Error", "Unable to add comment");
    } finally {
      setCommenting(false);
    }
  };

  const openCommentModal = (post: Status) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const openEditModal = (post: Status) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditModalVisible(true);
  };

  // ✅ ฟังก์ชันอัพเดทโพสต์
  const updatePost = async () => {
    if (!editingPost || !editContent.trim()) return;

    setEditing(true);
    try {
      // TODO: ต้องมี API สำหรับอัพเดทโพสต์
      // await statusApi.updateStatus(editingPost._id, editContent);
      Alert.alert("Success", "Your post has been updated");
      setEditModalVisible(false);
      await loadPosts();
    } catch (error: any) {
      Alert.alert("Error", "Unable to update post");
    } finally {
      setEditing(false);
    }
  };

  // ✅ ฟังก์ชันลบโพสต์
  const deletePost = async (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await statusApi.deleteStatus(postId);
            Alert.alert("Success", "Your post has been deleted");
            await loadPosts();
          } catch (error: any) {
            Alert.alert("Error", "Unable to delete post");
          }
        },
      },
    ]);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) {
        return minutes === 0 ? "Few seconds ago" : `${minutes} minutes ago`;
      } else if (hours < 24) {
        return `${hours} hours ago`;
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        return date.toLocaleDateString("th-TH");
      }
    } catch (error) {
      return "Unknown time";
    }
  };

  const renderPost = (post: Status) => {
    const postUserAvatar = getAvatarSource(post.createdBy);
    const postUserInitials = getInitials(post.createdBy);
    const isMyPost = user?._id === post.createdBy._id;

    return (
      <View key={post._id} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userAvatar}>
            {postUserAvatar ? (
              <Image source={postUserAvatar} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{postUserInitials}</Text>
            )}
          </View>
          <View style={styles.postUserInfo}>
            <Text style={styles.postAuthor}>
              {(post.createdBy?.email || "Unknown").split("@")[0]}
              {isMyPost && <Text style={styles.myPostBadge}> • My Post</Text>}
            </Text>
            <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
          </View>

          {isMyPost && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                Alert.alert("Manage Post", "Select an action", [
                  {
                    text: "Edit Post",
                    onPress: () => openEditModal(post),
                  },
                  {
                    text: "Delete Post",
                    style: "destructive",
                    onPress: () => deletePost(post._id),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ]);
              }}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{post.content || "No content"}</Text>

        {/* Post Stats */}
        <View style={styles.postStats}>
          <Text style={styles.likeCount}>{post.likeCount || 0} Likes</Text>
          <Text style={styles.commentCount}>
            {post.comment?.length || 0} Comments
          </Text>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => likePost(post._id)}
          >
            <MaterialCommunityIcons
              name={post.hasLiked ? "heart" : "heart-outline"}
              size={24}
              color={post.hasLiked ? "#dc2626" : "#64748b"}
            />
            <Text
              style={[styles.actionText, post.hasLiked && styles.likedText]}
            >
              {post.hasLiked ? "Unike" : "Like"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCommentModal(post)}
          >
            <MaterialCommunityIcons
              name="comment-outline"
              size={22}
              color="#64748b"
            />
            <Text style={styles.actionText}>Comments</Text>
          </TouchableOpacity>
        </View>

        {/* Display Comments Preview */}
        {post.comment && post.comment.length > 0 && (
          <View style={styles.commentsPreview}>
            <Text style={styles.commentsPreviewTitle}>Recent Comments:</Text>
            {post.comment.slice(0, 2).map((comment: Comment) => (
              <View key={comment._id} style={styles.commentPreview}>
                <Text style={styles.commentAuthor}>
                  {comment.createdBy.firstname}:
                </Text>
                <Text style={styles.commentText}> {comment.content}</Text>
              </View>
            ))}
            {post.comment.length > 2 && (
              <TouchableOpacity onPress={() => openCommentModal(post)}>
                <Text style={styles.moreComments}>
                  View all {post.comment.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CIS</Text>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {getAvatarSource(user) ? (
                <Image
                  source={getAvatarSource(user)}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{getInitials(user)}</Text>
              )}
            </View>
            <Text style={styles.userName}>Hi, {user?.firstname || "User"}</Text>
          </View>
        </View>
      </View>

      {/* Create Post Card */}
      <View style={styles.createPostCard}>
        <View style={styles.postHeader}>
          <View style={styles.userAvatar}>
            {getAvatarSource(user) ? (
              <Image
                source={getAvatarSource(user)}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(user)}</Text>
            )}
          </View>
          <Text style={styles.postPrompt}>What do you think?</Text>
        </View>

        <TextInput
          style={styles.postInput}
          placeholder="Share your story or thoughts..."
          value={newPost}
          onChangeText={setNewPost}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />

        <View style={styles.postActions}>
          <Text style={styles.charCount}>{newPost.length}/500</Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!newPost.trim() || posting) && styles.postButtonDisabled,
            ]}
            onPress={createPost}
            disabled={!newPost.trim() || posting}
          >
            <Text style={styles.postButtonText}>
              {posting ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Feed */}
      <ScrollView
        style={styles.feed}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.feedTitle}>Latest Posts</Text>

        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map(renderPost)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share your story in the community!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCommentModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <ScrollView style={styles.commentsList}>
                {selectedPost.comment?.length > 0 ? (
                  selectedPost.comment.map((comment: Comment) => (
                    <View key={comment._id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthorModal}>
                          {comment.createdBy.firstname}{" "}
                          {comment.createdBy.lastname}
                        </Text>
                        <Text style={styles.commentTime}>
                          {formatTime(comment.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.noComments}>
                    <Text style={styles.noCommentsText}>
                      ยังไม่มีความคิดเห็น
                    </Text>
                    <Text style={styles.noCommentsSubtext}>
                      เป็นคนแรกที่แสดงความคิดเห็น!
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.commentButton,
                  (!newComment.trim() || commenting) &&
                    styles.commentButtonDisabled,
                ]}
                onPress={addComment}
                disabled={!newComment.trim() || commenting}
              >
                <Text style={styles.commentButtonText}>
                  {commenting ? "..." : "Send"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.editInput}
              placeholder="Edit your post..."
              value={editContent}
              onChangeText={setEditContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  (!editContent.trim() || editing) &&
                    styles.updateButtonDisabled,
                ]}
                onPress={updatePost}
                disabled={!editContent.trim() || editing}
              >
                <Text style={styles.updateButtonText}>
                  {editing ? "Updating..." : "Update"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1e40af",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  createPostCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  postPrompt: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  postInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
  },
  postButton: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  postButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postUserInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  myPostBadge: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "400",
  },
  postTime: {
    fontSize: 12,
    color: "#64748b",
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 16,
  },
  postStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
    marginBottom: 12,
  },
  likeCount: {
    fontSize: 13,
    color: "#64748b",
    marginRight: 16,
  },
  commentCount: {
    fontSize: 13,
    color: "#64748b",
  },
  // Menu Button
  menuButton: {
    padding: 4,
  },
  // Post Actions
  postActionsFeed: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 8,
  },
  likedText: {
    color: "#dc2626",
  },
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  commentsPreviewTitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
  },
  commentPreview: {
    flexDirection: "row",
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  commentText: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },
  moreComments: {
    fontSize: 11,
    color: "#1e40af",
    fontStyle: "italic",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#64748b",
  },
  commentsList: {
    maxHeight: 300,
    padding: 20,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthorModal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  commentTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  commentContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  commentButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  commentButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // No Comments State
  noComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  // Edit Modal Styles
  editInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    margin: 20,
    backgroundColor: "#f8fafc",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  cancelEditButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelEditText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  updateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1e40af",
  },
  updateButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  updateButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});
