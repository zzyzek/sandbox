#!/usr/bin/env python3
"""Command-line front end; see `python3 zzn_cli.py --help`."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zzn.cli import main

sys.exit(main())
