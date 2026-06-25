# Security Specification: IRA AI Firestore Security Rules

## Data Invariants
1. **User Profile (`/users/{userId}`) Ownership**:
   * A user profile can only be created or modified by the user with matching authenticated UID (`request.auth.uid == userId`).
   * No user can write, update, or delete profiles belonging to other users.
   * Access to user profile fields such as `email` must be restricted to the owner (`request.auth.uid == userId`).

2. **Chat Room (`/chats/{chatId}`) Boundaries**:
   * A chat document must belong to the user who created it (`incoming().userId == request.auth.uid`).
   * Read, update, and delete access must be strictly restricted to the owner (`existing().userId == request.auth.uid`).
   * Modifying other users' chats, or writing a chat without being signed in, is forbidden.
   * Total number of fields must be validated, and keys must conform to required formats.

3. **Message (`/messages/{messageId}`) Isolation**:
   * A message can only be added or modified if the message belongs to a chat room that is owned by the current authenticated user.
   * Alternatively, if flat message collection is used, the message structure must explicitly contain fields linkable to the user, or be verified against the parent chat room (`get(/databases/$(database)/documents/chats/$(incoming().chatId)).data.userId == request.auth.uid`).
   * No user can inspect or alter conversation logs belonging to another user's chat sessions.

---

## The "Dirty Dozen" Payloads (Exploit Vector Attacks)

Here are twelve distinct malicious payloads designed to test and breach our Firestore validations, all of which must return `PERMISSION_DENIED` under the security rules:

1. **Identity Spoofing - Profile Injection**:
   * Attempting to create a profile under another user's UID.
   * Path: `users/attacker_uid` (Authenticated as `user123`).

2. **Privilege Escalation - Schema Pollution**:
   * Attempting to write arbitrary unlisted fields in the user document (e.g., `"role": "admin"` or `"isAdmin": true`).
   * Path: `users/user123` with extra properties.

3. **Anonymity Bypass - No Auth**:
   * Attempting to create a chat room when unauthenticated (`request.auth == null`).
   * Path: `chats/chat_abc`.

4. **Resource Hijacking - Chat Stealing**:
   * Attacker `attacker_uid` attempts to read user `user123`'s private chat document.
   * Path: `chats/chat123` (Owner: `user123`).

5. **Relational Spoofing - Chat Owner Forgery**:
   * Authenticated as `user123`, trying to create a chat with `userId` set to `victim_uid` to frame/hijack.
   * Path: `chats/forged_chat` with `userId: "victim_uid"`.

6. **ID Poisoning - Excessively long doc IDs**:
   * Attempting to write a chat room with a document ID of 10KB to trigger resource depletion.
   * Path: `chats/{10KB_long_string_id}`.

7. **Dangling Message Infiltration**:
   * Attempting to insert a chat message linked to a private chat room owned by another user.
   * Path: `messages/msg_xyz` with `chatId: "victim_chat_123"` (Where `victim_chat_123` belongs to `victim_uid`).

8. **Immutability Breach - Tampering with Birthdays**:
   * Attempting to update the `createdAt` timestamp of an existing chat room.
   * Path: `chats/chat123` changing `createdAt` to a historical/future absolute date.

9. **Temporal Jamming - Client Timestamp Forgery**:
   * Attempting to create or update a chat with client-generated `updatedAt` instead of `request.time`.
   * Path: `chats/chat123` with custom clock settings.

10. **Type Pollution - Boolean representation**:
    * Attempting to update a text field like `title` with a boolean or a map object.
    * Path: `chats/chat123` with `title: true`.

11. **Dangling User/Orphan Record**:
    * Attempting to write a chat room referencing a non-existent or deleted parent `users` record.
    * Path: `chats/chat123` with non-existent owner ID.

12. **Out of bounds size attack**:
    * Injecting massive 5MB text into the `lastMessageText` field of a chat document.
    * Path: `chats/chat123` with a super long string.

---

## Test Runner Verification (Declarative Spec)
A robust security ruleset shuts down all twelve categories. In the next steps, we will construct the security rules inside `firestore.rules` and run them through verification.
