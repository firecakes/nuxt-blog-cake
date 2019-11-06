-- Up 
CREATE TABLE post (
    id INTEGER PRIMARY KEY,
    entry TEXT NOT NULL,
    preview TEXT NOT NULL,
    title TEXT NOT NULL,
    directory TEXT NOT NULL,
    timestamp_iso TEXT NOT NULL
);

CREATE TABLE tag (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE ON CONFLICT IGNORE
);

CREATE TABLE post_tag (
    tag_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post (id),
    FOREIGN KEY (tag_id) REFERENCES tag (id),
    PRIMARY KEY (tag_id, post_id)
);

CREATE TABLE collection (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    timestamp_iso TEXT NOT NULL
);

CREATE TABLE collection_item (
    collection_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    order_number INTEGER NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES collection (id),
    FOREIGN KEY (post_id) REFERENCES post (id),
    PRIMARY KEY (collection_id, order_number)
);


-- Down 
DROP TABLE collection_items;
DROP TABLE collection;
DROP TABLE post_tag;
DROP TABLE tag;
DROP TABLE post;