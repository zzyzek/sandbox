#!/bin/bash

rm -f *.log *.aux *.abs *.log *.out *.xmpdata *.xmpi *.bbl *.blg
pdflatex PO_BMS.tex
pdflatex PO_BMS_font_libertine.tex
#bibtex PO_BMS
#pdflatex PO_BMS.tex
#pdflatex PO_BMS.tex

