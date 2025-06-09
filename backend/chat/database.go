package chat

import (
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

// Database interface for chat operations
type Database interface {
	SaveMessage(message *Message) error
	GetMessageHistory(userID, receiverID string, limit, offset int) ([]*Message, error)
	UpdateOnlineStatus(userID string, isOnline bool) error
	UpdateTypingStatus(userID, receiverID string, isTyping bool) error
	GetOnlineUsers() ([]string, error)
	Close() error
}

// PostgresDB implements the Database interface
type PostgresDB struct {
	db *sql.DB
}

// NewPostgresDB creates a new PostgresDB instance
func NewPostgresDB(connStr string) (*PostgresDB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresDB{db: db}, nil
}

// SaveMessage saves a message to the database
func (p *PostgresDB) SaveMessage(message *Message) error {
	query := `
		INSERT INTO messages (sender_id, receiver_id, content, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id`

	_, err := p.db.Exec(query,
		message.UserID,
		message.ReceiverID,
		message.Content,
		message.Timestamp,
	)
	return err
}

// GetMessageHistory retrieves message history between two users
func (p *PostgresDB) GetMessageHistory(userID, receiverID string, limit, offset int) ([]*Message, error) {
	query := `
		SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, u.username
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE (m.sender_id = $1 AND m.receiver_id = $2)
		   OR (m.sender_id = $2 AND m.receiver_id = $1)
		ORDER BY m.created_at DESC
		LIMIT $3 OFFSET $4`

	rows, err := p.db.Query(query, userID, receiverID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*Message
	for rows.Next() {
		var msg Message
		var timestamp time.Time
		err := rows.Scan(
			&msg.UserID,
			&msg.ReceiverID,
			&msg.Content,
			&timestamp,
			&msg.Username,
		)
		if err != nil {
			return nil, err
		}
		msg.Timestamp = timestamp
		msg.Type = "message"
		messages = append(messages, &msg)
	}

	return messages, nil
}

// UpdateOnlineStatus updates a user's online status
func (p *PostgresDB) UpdateOnlineStatus(userID string, isOnline bool) error {
	query := `
		INSERT INTO online_status (user_id, is_online, last_seen)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id)
		DO UPDATE SET is_online = $2, last_seen = $3`

	_, err := p.db.Exec(query, userID, isOnline, time.Now())
	return err
}

// UpdateTypingStatus updates a user's typing status
func (p *PostgresDB) UpdateTypingStatus(userID, receiverID string, isTyping bool) error {
	query := `
		INSERT INTO typing_status (user_id, receiver_id, is_typing, updated_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, receiver_id)
		DO UPDATE SET is_typing = $3, updated_at = $4`

	_, err := p.db.Exec(query, userID, receiverID, isTyping, time.Now())
	return err
}

// GetOnlineUsers retrieves a list of online users
func (p *PostgresDB) GetOnlineUsers() ([]string, error) {
	query := `
		SELECT user_id
		FROM online_status
		WHERE is_online = true
		AND last_seen > NOW() - INTERVAL '5 minutes'`

	rows, err := p.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []string
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		users = append(users, userID)
	}

	return users, nil
}

// Close closes the database connection
func (p *PostgresDB) Close() error {
	return p.db.Close()
} 