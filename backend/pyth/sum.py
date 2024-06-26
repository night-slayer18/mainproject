#!/usr/bin/env python
from __future__ import unicode_literals
import argparse
import os
import re
from itertools import starmap
import multiprocessing
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi
import pysrt
import imageio
import youtube_dl
import chardet
import nltk
import subprocess
# imageio.plugins.ffmpeg.download()
nltk.download('punkt')

from moviepy.editor import VideoFileClip, concatenate_videoclips
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from sumy.summarizers.lsa import LsaSummarizer


# imageio.plugins.ffmpeg.download()


def summarize(srt_file, n_sentences, language="english"):
    """ Generate segmented summary

    Args:
        srt_file(str) : The name of the SRT FILE
        n_sentences(int): No of sentences
        language(str) : Language of subtitles (default to English)

    Returns:
        list: segment of subtitles

    """
    parser = PlaintextParser.from_string(
        srt_to_txt(srt_file), Tokenizer(language))
    stemmer = Stemmer(language)
    summarizer = LsaSummarizer(stemmer)
    summarizer.stop_words = get_stop_words(language)
    segment = []
    for sentence in summarizer(parser.document, n_sentences):
        index = int(re.findall("\(([0-9]+)\)", str(sentence))[0])
        item = srt_file[index]
        segment.append(srt_segment_to_range(item))
    return segment


def srt_to_txt(srt_file):
    """ Extract text from subtitles file

    Args:
        srt_file(str): The name of the SRT FILE

    Returns:
        str: extracted text from subtitles file

    """
    text = ''
    for index, item in enumerate(srt_file):
        if item.text.startswith("["):
            continue
        text += "(%d) " % index
        text += item.text.replace("\n", "").strip("...").replace(
                                     ".", "").replace("?", "").replace("!", "")
        text += ". "
    return text


def srt_segment_to_range(item):
    """ Handling of srt segments to time range

    Args:
        item():

    Returns:
        int: starting segment
        int: ending segment of srt

    """
    start_segment = item.start.hours * 60 * 60 + item.start.minutes * \
        60 + item.start.seconds + item.start.milliseconds / 1000.0
    end_segment = item.end.hours * 60 * 60 + item.end.minutes * \
        60 + item.end.seconds + item.end.milliseconds / 1000.0
    return start_segment, end_segment


def time_regions(regions):
    """ Duration of segments

    Args:
        regions():

    Returns:
        float: duration of segments

    """
    return sum(starmap(lambda start, end: end - start, regions))


def find_summary_regions(srt_filename, duration=30, language="english"):
    """ Find important sections

    Args:
        srt_filename(str): Name of the SRT FILE
        duration(int): Time duration
        language(str): Language of subtitles (default to English)

    Returns:
        list: segment of subtitles as "summary"

    """
    print(srt_filename)
    srt_file = pysrt.open(srt_filename)

    enc = chardet.detect(open(srt_filename, "rb").read())['encoding']
    srt_file = pysrt.open(srt_filename, encoding=enc)

    # generate average subtitle duration
    subtitle_duration = time_regions(
        map(srt_segment_to_range, srt_file)) / len(srt_file)
    # compute number of sentences in the summary file
    n_sentences = duration / subtitle_duration
    summary = summarize(srt_file, n_sentences, language)
    total_time = time_regions(summary)
    too_short = total_time < duration
    if too_short:
        while total_time < duration:
            n_sentences += 1
            summary = summarize(srt_file, n_sentences, language)
            total_time = time_regions(summary)
    else:
        while total_time > duration:
            n_sentences -= 1
            summary = summarize(srt_file, n_sentences, language)
            total_time = time_regions(summary)
    return summary


def create_summary(filename, regions):
    """ Join segments

    Args:
        filename(str): filename
        regions():
    Returns:
        VideoFileClip: joined subclips in segment

    """
    subclips = []
    input_video = VideoFileClip(filename)
    last_end = 0
    for (start, end) in regions:
        print(seconds_to_time(start),seconds_to_time(end))
        subclip = input_video.subclip(start, end)
        subclips.append(subclip)
        last_end = end
    return concatenate_videoclips(subclips)

def seconds_to_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return "{:02}:{:02}:{:02}".format(int(hours), int(minutes), int(seconds))

def time_to_seconds(time_str):
    h, m, s = map(int, time_str.split(':'))
    return h * 3600 + m * 60 + s


import pysrt

import pysrt

def trim_subtitle(input_srt, output_srt, start_time_str, end_time_str):
    # Load the SRT file
    subs = pysrt.open(input_srt)
    
    # Convert start and end time to SubRipTime objects
    start_time_components = list(map(int, start_time_str.split(':')))
    end_time_components = list(map(int, end_time_str.split(':')))
    
    start_time = pysrt.SubRipTime(
        hours=start_time_components[0],
        minutes=start_time_components[1],
        seconds=start_time_components[2]
    )
    
    end_time = pysrt.SubRipTime(
        hours=end_time_components[0],
        minutes=end_time_components[1],
        seconds=end_time_components[2]
    )
    
    # Filter subtitles within the specified range
    trimmed_subs = [sub for sub in subs if start_time <= sub.start <= end_time and start_time <= sub.end <= end_time]
    
    # Adjust the index of subtitles
    for i, sub in enumerate(trimmed_subs):
        sub.index = i + 1
    
    # Convert trimmed_subs list back to a SubtitleFile object
    trimmed_subs = pysrt.SubRipFile(trimmed_subs)
    
    # Save the trimmed SRT file to the output file
    trimmed_subs.save(output_srt, encoding='utf-8')
    #print("Subtitles trimmed successfully.")






def get_summary(filename="1.mp4", subtitles="1.srt"):
    """ Abstract function

    Args:
        filename(str): Name of the Video file (defaults to "1.mp4")
        subtitles(str): Name of the subtitle file (defaults to "1.srt")

    Returns:
        True

    """
    # a=input("Trim?")
    # if a=='y':
    #     input_video_path = filename
    #     input_subtitle_path = subtitles
    #     start_time = input("Enter the starting time (in format hh:mm:ss): ")
    #     end_time = input("Enter the ending time (in format hh:mm:ss): ")
        
    #     # Output paths
    #     output_video_path = os.path.splitext(input_video_path)[0] + "_trimmed.mp4"
    #     output_subtitle_path = os.path.splitext(input_subtitle_path)[0] + "_trimmed.srt"
        

        
    #     # Trim the subtitle file
    #     trim_subtitle(input_subtitle_path, output_subtitle_path, start_time, end_time)
        
    #     regions = find_summary_regions(output_subtitle_path, 200, "english")
    #     summary = create_summary(filename, regions)
    #     base, ext = os.path.splitext(filename)
    #     output = "{0}_1.mp4".format(base)
    #     summary.to_videofile(
    #                 output,
    #                 codec="libx264",
    #                 temp_audiofile="temp.m4a", remove_temp=True, audio_codec="aac")
    #     return True
    # else:
    folder = "C:/Users/acer/mainproject/backend/data/"
    input_video_path = os.path.join(folder, filename)
    video_clip = VideoFileClip(input_video_path)

    # Get the duration of the video in seconds
    duration_seconds = video_clip.duration
    input_subtitle_path = os.path.join(folder, subtitles)
    regions = find_summary_regions(input_subtitle_path, duration_seconds*0.3, "english")
    summary = create_summary(input_video_path, regions)
    base, ext = os.path.splitext(filename)
    destination_folder = "C:/Users/acer/mainproject/backend/data/"

    # Create the full path to the output video file
    output = os.path.join(destination_folder, "{0}_1.mp4".format(base))
    summary.to_videofile(
                output,
                codec="libx264",
                temp_audiofile="temp.m4a", remove_temp=True, audio_codec="aac")
    return True


# def download_video_srt(url):
#     """ Downloads specified Youtube video's subtitles as a vtt/srt file.

#     Args:
#         subs(str): Full url of Youtube video

#     Returns:
#         True


#     The video will be downloaded as 1.mp4 and its subtitles as 1.(lang).srt
#     Both, the video and its subtitles, will be downloaded to the same location
#     as that of this script (sum.py)

#     """
#     ydl_opts = {
#         'format': 'best',
#         'outtmpl': '1.%(ext)s',
#         'subtitlesformat': 'srt',
#         'writeautomaticsub': True,
#         # 'allsubtitles': True # Get all subtitles
#     }

#     movie_filename = ""
#     subtitle_filename = ""
#     with youtube_dl.YoutubeDL(ydl_opts) as ydl:
#         # ydl.download([subs])
#         result = ydl.extract_info("{}".format(url), download=True)
#         movie_filename = ydl.prepare_filename(result)
#         subtitle_info = result.get("requested_subtitles")
#         subtitle_language = subtitle_info.keys()[0]
#         subtitle_ext = subtitle_info.get(subtitle_language).get("ext")
#         subtitle_filename = movie_filename.replace(".mp4", ".%s.%s" %
#                                                    (subtitle_language,
#                                                     subtitle_ext))
#     return movie_filename, subtitle_filename
def download_video(url, filename="1.mp4"):
    folder = "C:/Users/acer/mainproject/backend/data/"
    try:
        # Create a YouTube object
        yt = YouTube(url)

        # Get the highest resolution stream
        video_stream = yt.streams.get_highest_resolution()

        file_path = os.path.join(folder, filename)

        # Download the video to the current directory with the specified filename
        video_stream.download(output_path=folder,filename=filename)

        #print(f"Download successful! Saved as {filename}")
        return filename
    except Exception as e:
        print(f"Error: {e}")

def get_video_id(url):
    try:
        # Extract video ID from the URL
        yt = YouTube(url)
        video_id = yt.video_id
        return video_id
    except Exception as e:
        print(f"Error extracting video ID: {e}")
        return None

def download_cc_as_srt(video_url, output_filename="1.srt"):
        # Get the video ID from the URL
        folder = "C:/Users/acer/mainproject/backend/data/"
        file_path = os.path.join(folder, output_filename)

        video_id = get_video_id(video_url)


        if video_id:
            # Get the transcript for the YouTube video
            transcript = YouTubeTranscriptApi.get_transcript(video_id)

            if transcript:
                # Write the transcript to an SRT file
                with open(file_path, 'w', encoding='utf-8') as srt_file:
                    for i, entry in enumerate(transcript, start=1):
                        start_time = entry['start']
                        end_time = start_time + entry['duration']
                        text = entry['text']
                        
                        srt_file.write(f"{i}\n{format_time(start_time)} --> {format_time(end_time)}\n{text}\n\n")

                print(f"SRT file generated successfully: {output_filename}")
            else:
                print("No transcript available for this video.")
        else:
            print("Failed to extract video ID.")
        return output_filename

def format_time(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d},000"

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Watch videos quickly")
    parser.add_argument('-i', '--video-file', help="Input video file")
    parser.add_argument('-s', '--subtitles-file',
                        help="Input subtitle file (srt)")
    parser.add_argument('-u', '--url', help="Video url", type=str)
    parser.add_argument('-k', '--keep-original-file',
                        help="Keep original movie & subtitle file",
                        action="store_true", default=False)

    args = parser.parse_args()

    url = args.url
    keep_original_file = args.keep_original_file

    if not url:
        # proceed with general summarization
        get_summary(args.video_file, args.subtitles_file)

    else:
        # download video with subtitles
        movie_filename= download_video(url)
        subtitle_filename = download_cc_as_srt(url)
        summary_retrieval_process = multiprocessing.Process(target=get_summary, args=(movie_filename, subtitle_filename))
        summary_retrieval_process.start()
        summary_retrieval_process.join()
        if not keep_original_file:
            os.remove(movie_filename)
            os.remove(subtitle_filename)
            print("[sum.py] Remove the original files")