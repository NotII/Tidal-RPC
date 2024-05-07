# TIDAL Discord Rich Presence

This script enables Discord Rich Presence integration for TIDAL music streaming service on Windows. It allows your Discord status to automatically reflect the song you're currently listening to on TIDAL, displaying the artist, song name, and album art.

## Dependencies

- Python 3.x
- [psutil](https://pypi.org/project/psutil/)
- [pypresence](https://pypi.org/project/pypresence/)
- [tidalapi](https://pypi.org/project/tidalapi/)

## Installation

1. Clone this repository or download the script `tidal_rpc.py`.
2. Install dependencies using pip:

    ```bash
    pip install psutil pypresence tidalapi
    ```

3. Make sure you have Python added to your system PATH.
4. Run the script using Python:

    ```bash
    python tidal_rpc.py
    ```

## Usage

- Make sure TIDAL Desktop application is running on your system.
- Run the script, and it will automatically update your Discord status with the current song playing on TIDAL.
- You can customize the appearance of the Discord Rich Presence via the script.

## Customization

- You can modify the script to change the appearance of the Discord Rich Presence, such as the images used for album art.
- Refer to the documentation of [pypresence](https://github.com/qwertyquerty/pypresence) for more customization options.

## Issues and Contributions

If you encounter any issues with the script or have suggestions for improvements, feel free to open an issue or pull request
