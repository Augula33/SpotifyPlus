// Grab any variables you need

const react = Spicetify.React;
const reactDOM = Spicetify.ReactDOM;
const {
    CosmosAsync,
    URI,
    React: { useState, useEffect, useCallback },
    Platform: { History },
} = Spicetify;

const CONFIG = {
    activeTab: "Main",
    tabs: ["Main","Recent Songs"]
};

// Top Bar Content component
const TopBarContent = (props) => {
    return react.createElement("div", {
        style: {
            display: "flex",
            paddingTop: "15px",
            justifyContent: "flex-start", // Align tabs to the left
            gap: "100px", // Adjust the spacing between tabs
        }
    },
        props.links.map((link) =>
            react.createElement("div", {
                key: link,
                style: {
                    position: "relative",
                }
            },
                react.createElement("a", {
                    className: link === props.activeLink ? 'active' : '',
                    style: {
                        padding: "10px 20px", // Adjust the padding of the tabs
                        borderRadius: "20px", // Add border radius to create rounded edges
                        border: "1px solid white", // Add border with white color
                        color: "white", // Set text color
                        textDecoration: "none", // Remove underline
                    }
                }, link),
            )
        )
    );
};



async function retrievenext() {
    const popSongs = [
    'spotify:track:3GCL1PydwsLodcpv0Ll1ch',
    'spotify:track:1p80LdxRV74UKvL8gnD7ky',
    'spotify:track:273dCMFseLcVsoSWx59IoE',
  ];
    const randomIndex = Math.floor(Math.random() * popSongs.length);
    return popSongs[randomIndex];
  };

const currenturi = [];
let playlistinfo = '';
let playlistCreated = false;

async function createPlaylist(){
    const user = await CosmosAsync.get('https://api.spotify.com/v1/me');
    playlistinfo = CosmosAsync.post('https://api.spotify.com/v1/users/' + user.id + '/playlists', {
            name: 'SpotifyPlus Playlist'
        });
    return playlistinfo;
}



async function addtoplaylist(playlistinfo) {
    const playlisturi = playlistinfo.uri.split(":")[2]
    CosmosAsync.post('https://api.spotify.com/v1/playlists/' + playlisturi + '/tracks', {
            uris: likedlist
        });
    //createPlaylist();
    return true;
}

const likedlist = [];
async function addSongToLiked(song){
    likedlist.push(song);
}


async function send(){
    /*
    Uncreated function to send information of the song and information on wether it was liked/disliked/skipped.
    */
   return true;
} 
/*
async function clearsong() {
    return Spicetify.Platform.LocalStorageAPI.clearItem(this.songname)
        .then(() => true) // Resolves to true if the item is successfully cleared
        .catch(() => false); // Resolves to false if there's an error while clearing the item
}
/*used like this: 
clearsong()
    .then(success => {
        if (success) {
            console.log("Item successfully cleared.");
        } else {
            console.error("Failed to clear item.");
        }
    });
*/

async function nextsong(uri){
    Spicetify.Player.playUri(uri);
}

// Example usage:
const trackUri = "spotify:track:4iV5W9uYEdYUVa79Axb7Rh";
//
let tempplaylist = '';
let uri = '';
async function handleLike() {
    try {
        // Assuming send() is an asynchronous function
        await send("liked");
    } catch (error) {
        console.error("Error sending like to LLM:", error);
    }
    try{
        addSongToLiked(uri);
    } catch (error) {
        console.error("Error adding song to liked songs:", error);
    }
    

}

async function handleDislike() {
    try {
        // Assuming send() is an asynchronous function
        await send("disliked");
    } catch (error) {
        console.error("Error sending like to LLM:", error);
    }

}
async function handlePlayNext() {
    try {
        // Assuming send() is an asynchronous function
        await send("skipped");
    } catch (error) {
        console.error("Error sending like to LLM:", error);
    }

    try {
        // Assuming retrievenext() is an asynchronous function
        uri = await retrievenext();
        currenturi.length = 0;
        currenturi.push(uri);
    } catch (error) {
        console.error("Error retrieving next song from LLM:", error);
    }

    try {
        // Assuming nextsong(uri) is an asynchronous function
        await nextsong(uri);
    } catch (error) {
        console.error("Error playing next song:", error);
    }
}
async function handleCreatePlaylist() {
    try {
        // Assuming send() is an asynchronous function
        await send("playlist created");
    } catch (error) {
        console.error("Error sending playlist state to LLM:", error);
    }

    if (!playlistCreated){
        try {
            playlistCreated = true
            tempplaylist = await createPlaylist();            
            await addtoplaylist(tempplaylist);
        } catch (error) {
        console.error("Error creating playlist:", error);
    }
    }
    else { 
        try {
            await addtoplaylist(tempplaylist);
    } catch (error) {
        console.error("Error adding song to playlist:", error);
    }
    }
}
// The main custom app render function. The component returned is what is rendered in Spotify.
function render() {
    return react.createElement(Grid, { title: "SpotifyPlus" });
}



// Our main component
class Grid extends react.Component {
    constructor(props) {
        super(props);
        Object.assign(this, props);
        this.state = {
            foo: "bar",
            data: "etc"
        };
    }

    render() {
        return react.createElement("section", {
                className: "contentSpacing",
            },
            react.createElement("div", {
                className: "marketplace-header",
            }, react.createElement("h1", null, this.props.title),
            ),
            react.createElement("div", {
                id: "marketplace-grid",
                className: "main-gridContainer-gridContainer",
                "data-tab": CONFIG.activeTab,
                style: {
                    display: "flex",
                    justifyContent: "space-between", // This will evenly distribute the items
                    flexWrap: "wrap", // Allow items to wrap to the next line if needed
                },
            },
                react.createElement("button", {
                    //onClick: () => handleDislike(param1, param2), // Call handleDislike with parameters
                    onClick: handleCreatePlaylist,
                    style: {
                        backgroundColor: "purple", // Change the background color of the button
                        color: "white", // Change the text color of the button
                        border: "none", // Remove the border
                        padding: "10px 20px", // Add padding
                        borderRadius: "5px", // Add border radius
                    }
                }, "Create Playlist"),
            ),
            react.createElement("footer", {
                style: {
                    margin: "auto",
                    bottom: 0,
                    left: 0,
                    position: "fixed",
                    textAlign: "center",
                    width: "100%", // Ensure the footer spans the full width
                    paddingTop: "20px", // Add padding at the top for spacing
                    paddingBottom: "40px"
                },
            }, 
                react.createElement("div", {
                    style: {
                        display: "flex",
                        justifyContent: "space-around", // This will evenly distribute the buttons
                        
                    },
                },
                react.createElement("button", {
                    //onClick: () => handleDislike(param1, param2), // Call handleDislike with parameters
                    onClick: handleDislike,
                    style: {
                        backgroundColor: "red", // Change the background color of the button
                        color: "white", // Change the text color of the button
                        border: "none", // Remove the border
                        padding: "10px 20px", // Add padding
                        borderRadius: "5px", // Add border radius
                    }
                }, "Dislike"),
                react.createElement("button", {
                    onClick: handlePlayNext,
                    style: {
                        backgroundColor: "blue", // Change the background color of the button
                        color: "white", // Change the text color of the button
                        border: "none", // Remove the border
                        padding: "10px 20px", // Add padding
                        borderRadius: "5px", // Add border radius
                    }
                }, "Play Next"),
                react.createElement("button", {
                    onClick: handleLike,
                    style: {
                        backgroundColor: "green", // Change the background color of the button
                        color: "white", // Change the text color of the button
                        border: "none", // Remove the border
                        padding: "10px 20px", // Add padding
                        borderRadius: "5px", // Add border radius
                    }
                }, "Like"),)),
                react.createElement(TopBarContent, {
                links: CONFIG.tabs,
                activeLink: CONFIG.activeTab,
            })
        );
    }
}