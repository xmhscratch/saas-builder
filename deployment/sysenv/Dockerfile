FROM localhost:5000/gonode:latest

WORKDIR /tmp

RUN \
    apk -U upgrade; \
    \
    apk add --upgrade --no-cache \
        bash \
        bzip2-dev \
        ca-certificates \
        chrpath \
        clang-dev \
        curl \
        doas \
        dpkg-dev \
        fftw-dev \
        fontconfig \
        fontconfig-dev \
        freetype-dev \
        ghostscript \
        ghostscript-dev \
        git \
        git-lfs \
        gtk+2.0 \
        inotify-tools \
        jpeg \
        jpeg-dev \
        lcms2 \
        lcms2-dev \
        leptonica \
        leptonica-dev \
        libexif \
        libexif-dev \
        libffi \
        libffi-dev \
        libgphoto2 \
        libgphoto2-dev \
        libheif-dev \
        libjpeg \
        libjpeg-turbo \
        libjpeg-turbo-dev \
        libltdl \
        libpcrecpp \
        libpng \
        libpng-dev \
        libraw1394 \
        libraw1394-dev \
        librsvg \
        librsvg-dev \
        libunwind \
        libwebp \
        libwebp-dev \
        libwmf \
        libwmf-dev \
        libx11 \
        libx11-dev \
        libxext \
        libxext-dev \
        libxml2 \
        libxml2-dev \
        libxt \
        libxt-dev \
        linux-headers \
        m4 \
        msttcorefonts-installer \
        musl \
        musl-dbg \
        musl-dev \
        musl-utils \
        openblas \
        openblas-dev \
        openjpeg-dev \
        openssh-client \
        openssl \
        openexr-libopenexrcore \
        pango-dev \
        pcre \
        pcre-dev \
        pcre-tools \
        perl-dev \
        potrace \
        potrace-dev \
        python3 \
        python3-dev \
        py3-pip \
        tar \
        tesseract-ocr \
        tesseract-ocr-dev \
        tiff-dev \
        unzip \
        wget \
        zip \
        zlib-dev \
        zlib; \
    \
    apk add --upgrade --no-cache \
        ccache@3.14 \
        hdf5-dev@3.14 \
        hdf5@3.14 \
        libexecinfo@3.16 \
        libexecinfo-dev@3.16 \
        jasper@3.10 \
        jasper-dev@3.10; \
    \
    apk add --upgrade --no-cache \
            --allow-untrusted --update-cache \
            --repository "http://dl-cdn.alpinelinux.org/alpine/edge/main" \
            --repository "http://dl-cdn.alpinelinux.org/alpine/edge/community" \
        git \
        glog \
        glog-dev \
        gflags \
        gflags-dev \
        libjxl-dev \
        samurai; \
    \
    apk add --virtual .build-deps \
        file \
        file-dev \
        git-lfs \
        nano \
        nasm \
        ninja \
        openssh-client \
        openssl-dev \
        slibtool \
        valgrind \
        valgrind-dev; \
    \
    apk add --virtual .build-deps \
        autoconf \
        automake \
        alpine-sdk \
        binutils-gold \
        build-base \
        cmake \
        gnu-libiconv \
        gnu-libiconv-dev \
        gnupg \
        glib \
        glib-dev \
        libgcc \
        libressl-dev \
        libtool \
        linux-headers \
        libstdc++ \
        make \
        pkgconf \
        pkgconf-dev; \
    \
    # setup environment
    export CC=/usr/bin/gcc; \
    export CXX=/usr/bin/g++; \
    export CC=/usr/bin/clang; \
    export CXX=/usr/bin/clang++; \
    export PKG_CONFIG=/usr/bin/pkg-config; \
    export PKG_CONFIG_PATH=$(pkg-config --variable pc_path pkg-config):$PKG_CONFIG_PATH; \
    export PKG_CONFIG_EXECUTABLE=/usr/bin/pkg-config; \
    export GLIB_CFLAGS=$(pkg-config --cflags glib-2.0); \
    export GLIB_LIBS=$(pkg-config --libs glib-2.0); \
    export LD_LIBRARY_PATH=/usr/lib:/usr/lib64:$LD_LIBRARY_PATH; \
    ln -s /usr/include/locale.h /usr/include/xlocale.h; \
    ldconfig -v; \
    # python3
    python3 -m venv /root/.venv; \
    . /root/.venv/bin/activate; \
    python3 -m pip install setuptools wheel; \
    python3 -m pip install --force-reinstall --upgrade numpy; \
    # apk info -v | sort; \
    # export PYTHON2_EXECUTABLE=$(which python2); \
    # export PYTHON2_INCLUDE_DIR=$(python2 -c "from distutils.sysconfig import get_python_inc; print(get_python_inc())"); \
    # export PYTHON2_INCLUDE_PATH=$PYTHON2_INCLUDE_DIR; \
    # export PYTHON2_VERSION=$(echo $PYTHON2_INCLUDE_PATH | rev | cut -d '/' -f 1 | rev); \
    # export PYTHON2_LIBRARY=$(python2 -c "import distutils.sysconfig as sysconfig; print(sysconfig.get_config_var('LIBDIR'))"); \
    # export PYTHON2_LIBRARIES=$PYTHON2_LIBRARY; \
    # # export PYTHON2_NUMPY_VERSION=$(python2 -c "import numpy; print(numpy.__version__)"); \
    # # export PYTHON2_NUMPY_INCLUDE_DIRS=$PYTHON2_LIBRARY/$PYTHON2_VERSION/site-packages/numpy/core/include; \
    \
    export PYTHON3_EXECUTABLE=$(which python3); \
    export PYTHON3_INCLUDE_DIR=$(python3 -c "from distutils.sysconfig import get_python_inc; print(get_python_inc())"); \
    export PYTHON3_INCLUDE_PATH=$PYTHON3_INCLUDE_DIR; \
    export PYTHON3_VERSION=$(echo $PYTHON3_INCLUDE_PATH | rev | cut -d '/' -f 1 | rev); \
    export PYTHON3_LIBRARY=$(python3 -c "import distutils.sysconfig as sysconfig; print(sysconfig.get_config_var('LIBDIR'))"); \
    export PYTHON3_LIBRARIES=$PYTHON3_LIBRARY; \
    export PYTHON3_NUMPY_VERSION=$(python3 -c "import numpy; print(numpy.__version__)"); \
    export PYTHON3_NUMPY_INCLUDE_DIRS=$PYTHON3_LIBRARY/$PYTHON3_VERSION/site-packages/numpy/core/include; \
    \
    export PYTHONPATH=$PYTHON3_LIBRARY/$PYTHON3_VERSION/site-packages:$PYTHONPATH; \
    \
    # install watchman
    wget --progress=bar:force:noscroll https://github.com/facebook/watchman/archive/refs/tags/v4.9.0.zip -O /tmp/watchman-4.9.0.zip; \
    cd /tmp/; \
    unzip -q watchman-4.9.0.zip; \
    cd ./watchman-4.9.0; \
    ./autogen.sh; \
    autoconf; \
    ./configure \
        --enable-statedir=/tmp \
        # --without-python \
        # --without-pcre \
        --enable-lenient; \
    make -j$(getconf _NPROCESSORS_ONLN); \
    make install; \
    watchman --version; \
    # install opencv
    wget --progress=bar:force:noscroll https://github.com/opencv/opencv/archive/3.4.16.zip -O /tmp/opencv-3.4.16.zip; \
    wget --progress=bar:force:noscroll https://github.com/opencv/opencv_contrib/archive/3.4.16.zip -O /tmp/opencv_contrib-3.4.16.zip; \
    cd /tmp/; \
    unzip -q opencv-3.4.16; \
    unzip -q opencv_contrib-3.4.16; \
    cd ./opencv-3.4.16; \
    mkdir build && cd build; \
    cmake \
        -D BUILD_ANDROID_EXAMPLES=OFF \
        -D BUILD_ANDROID_SERVICE=OFF \
        -D BUILD_CUDA_STUBS=OFF \
        -D BUILD_DOCS=OFF \
        -D BUILD_EXAMPLES=OFF \
        -D BUILD_FAT_JAVA_LIB=OFF \
        -D BUILD_JAVA=OFF \
        -D BUILD_NEW_PYTHON_SUPPORT=ON \
        -D BUILD_PACKAGE=ON \
        -D BUILD_PERF_TESTS=OFF \
        -D BUILD_TESTS=OFF \
        -D BUILD_WITH_DEBUG_INFO=ON \
        -D BUILD_WITH_DYNAMIC_IPP=OFF \
        -D BUILD_WITH_STATIC_CRT=OFF \
        -D BUILD_opencv_apps=OFF \
        -D BUILD_opencv_aruco=OFF \
        -D BUILD_opencv_bgsegm=OFF \
        -D BUILD_opencv_bioinspired=OFF \
        -D BUILD_opencv_calib3d=ON \
        -D BUILD_opencv_ccalib=ON \
        -D BUILD_opencv_cnn_3dobj=ON \
        -D BUILD_opencv_core=ON \
        -D BUILD_opencv_cuciaimgproc=OFF \
        -D BUILD_opencv_cuclafilters=OFF \
        -D BUILD_opencv_cudaarathm=OFF \
        -D BUILD_opencv_cudabgsegm=OFF \
        -D BUILD_opencv_cudacodec=OFF \
        -D BUILD_opencv_cudafeatures2d=0FF \
        -D BUILD_opencv_cudalegacy=OFF \
        -D BUILD_opencv_cudaobjdetect=OFF \
        -D BUILD_opencv_cudaoptflow=OFF \
        -D BUILD_opencv_cudastereo=OFF \
        -D BUILD_opencv_cudawarping=OFF \
        -D BUILD_opencv_cudev=OFF \
        -D BUILD_opencv_cvv=OFF \
        -D BUILD_opencv_datasets=ON \
        -D BUILD_opencv_dnn=ON \
        -D BUILD_opencv_dnn_objdetect=ON \
        -D BUILD_opencv_dnns_easily_fooled=OFF \
        -D BUILD_opencv_dpm=OFF \
        -D BUILD_opencv_face=ON \
        -D BUILD_opencv_features2d=ON \
        -D BUILD_opencv_flann=ON \
        -D BUILD_opencv_freetype=ON \
        -D BUILD_opencv_fuzzy=ON \
        -D BUILD_opencv_hal=ON \
        -D BUILD_opencv_highgui=ON \
        -D BUILD_opencv_imgcodecs=ON \
        -D BUILD_opencv_imgproc=ON \
        -D BUILD_opencv_js=OFF \
        -D BUILD_opencv_line_descriptor=OFF \
        -D BUILD_opencv_matlab=OFF \
        -D BUILD_opencv_ml=ON \
        -D BUILD_opencv_objdetect=ON \
        -D BUILD_opencv_optflow=OFF \
        -D BUILD_opencv_ovis=OFF \
        -D BUILD_opencv_photo=ON \
        -D BUILD_opencv_plot=OFF \
        -D BUILD_opencv_python2=OFF \
        -D BUILD_opencv_python3=ON \
        -D BUILD_opencv_reg=OFF \
        -D BUILD_opencv_rgbd=OFF \
        -D BUILD_opencv_saliency=OFF \
        -D BUILD_opencv_sfm=OFF \
        -D BUILD_opencv_sharp=ON \
        -D BUILD_opencv_stereo=OFF \
        -D BUILD_opencv_structured_light=OFF \
        -D BUILD_opencv_surface_matching=OFF \
        -D BUILD_opencv_text=ON \
        -D BUILD_opencv_tracking=OFF \
        -D BUILD_opencv_world=OFF \
        -D BUILD_opencv_xfeatures2d=OFF \
        -D BUILD_opencv_ximgproc=OFF \
        -D BUILD_opencv_xobjdetect=OFF \
        -D BUILD_opencv_xphoto=OFF \
        -D CMAKE_BUILD_TYPE=RELEASE \
        -D CMAKE_INSTALL_LIBDIR=lib \
        -D CMAKE_INSTALL_PREFIX=/usr \
        -D CMAKE_INSTALL_RPATH_USE_LINK_PATH=TRUE \
        -D CMAKE_SKIP_INSTALL_RPATH=FALSE \
        -D ENABLE_FAST_MATH=OFF \
        -D ENABLE_NEON:BOOL=OFF \
        -D INSTALL_ANDROID_EXAMPLES=OFF \
        -D INSTALL_CREATE_DISTRIB=OFF \
        -D INSTALL_C_EXAMPLES=OFF \
        -D INSTALL_PYTHON_EXAMPLES=OFF \
        -D INSTALL_TESTS=OFF \
        -D INSTALL_TO_MANGLED_PATHS=OFF \
        -D OPENCV_EXTRA_MODULES_PATH=$PWD/../../opencv_contrib-3.4.16/modules \
        -D OPENCV_SKIP_PYTHON_LOADER=ON \
        -DPYTHON_EXECUTABLE=$PYTHON3_EXECUTABLE \
        -DPYTHON_DEFAULT_EXECUTABLE=$PYTHON3_EXECUTABLE \
        # -DPYTHON2_EXECUTABLE=$PYTHON2_EXECUTABLE \
        # -DPYTHON2_INCLUDE_DIR=$PYTHON2_INCLUDE_DIR \
        # -DPYTHON2_LIBRARY=$PYTHON2_LIBRARY \
        # -DPYTHON2_NUMPY_VERSION=$PYTHON2_NUMPY_VERSION \
        # -DPYTHON2_INCLUDE_PATH=$PYTHON2_INCLUDE_PATH \
        # -DPYTHON2_LIBRARIES=$PYTHON2_LIBRARIES \
        # # -DPYTHON2_NUMPY_INCLUDE_DIRS=$PYTHON2_NUMPY_INCLUDE_DIRS \
        -DPYTHON3_EXECUTABLE=$PYTHON3_EXECUTABLE \
        -DPYTHON3_INCLUDE_DIR=$PYTHON3_INCLUDE_DIR \
        -DPYTHON3_LIBRARY=$PYTHON3_LIBRARY \
        -DPYTHON3_NUMPY_VERSION=$PYTHON3_NUMPY_VERSION \
        -DPYTHON3_INCLUDE_PATH=$PYTHON3_INCLUDE_PATH \
        -DPYTHON3_LIBRARIES=$PYTHON3_LIBRARIES \
        # -DPYTHON3_NUMPY_INCLUDE_DIRS=$PYTHON3_NUMPY_INCLUDE_DIRS \
        -D WITH_1394=OFF \
        -D WITH_ARAVIS=OFF \
        -D WITH_AVFOUNDATION=OFF \
        -D WITH_CARBON=OFF \
        -D WITH_CAROTENE=OFF \
        -D WITH_CLP=OFF \
        -D WITH_CPUFEATURES=OFF \
        -D WITH_CSTRIPES=OFF \
        -D WITH_CUBLAS=OFF \
        -D WITH_CUDA=OFF \
        -D WITH_CUFFT=OFF \
        -D WITH_DIRECTX=OFF \
        -D WITH_DSHOW=OFF \
        -D WITH_EIGEN=OFF \
        -D WITH_FFMPEG=OFF \
        -D WITH_GDAL=OFF \
        -D WITH_GDCM=OFF \
        -D WITH_GIGEAPI=OFF \
        -D WITH_GPHOTO2=ON \
        -D WITH_GSTREAMER=OFF \
        -D WITH_GTK=OFF \
        -D WITH_HALIDE=ON \
        -D WITH_INF_ENGINE=ON \
        -D WITH_INTELPERC=OFF \
        -D WITH_IPP=OFF \
        -D WITH_ITT=OFF \
        -D WITH_JASPER=ON \
        -D WITH_JPEG=ON \
        -D WITH_LAPACK=OFF \
        -D WITH_LIBV4L=OFF \
        -D WITH_MATLAB=OFF \
        -D WITH_MFX=OFF \
        -D WITH_MSMF=OFF \
        -D WITH_NVCUVID=OFF \
        -D WITH_OPENCL=ON \
        -D WITH_OPENCLAMDBLAS=OFF \
        -D WITH_OPENCLAMDFFT=OFF \
        -D WITH_OPENCL_SVM=OFF \
        -D WITH_OPENEXR=ON \
        -D WITH_OPENGL=ON \
        -D WITH_OPENMP=OFF \
        -D WITH_OPENNI2=OFF \
        -D WITH_OPENNI=OFF \
        -D WITH_OPENVX=OFF \
        -D WITH_PNG=ON \
        -D WITH_PTHREADS_PF=ON \
        -D WITH_PVAPI=OFF \
        -D WITH_QT=OFF \
        -D WITH_QTKIT=OFF \
        -D WITH_QUICKTIME=OFF \
        -D WITH_TBB=ON \
        -D WITH_TIFF=ON \
        -D WITH_UNICAP=OFF \
        -D WITH_V4L=OFF \
        -D WITH_VA=OFF \
        -D WITH_VA_INTEL=OFF \
        -D WITH_VFW=OFF \
        -D WITH_VTK=OFF \
        -D WITH_WEBP=ON \
        -D WITH_WIN32UI=OFF \
        -D WITH_XIMEA=OFF \
        -D WITH_XINE=OFF \
        ..; \
    make -j$(getconf _NPROCESSORS_ONLN) VERBOSE=1 && make -j$(getconf _NPROCESSORS_ONLN); \
    make install; \
    # python2 -c "import cv2; print(cv2.__version__);"; \
    python3 -c "import cv2; print(cv2.__version__);"; \
    \
    # install imagemagick
    apk add --upgrade \
        imagemagick \
        imagemagick-dev \
        imagemagick-libs \
        imagemagick-c++; \
    \
    # apk add --upgrade \
    #     imagemagick6@3.14 \
    #     imagemagick6-dev@3.14 \
    #     imagemagick6-libs@3.14 \
    #     imagemagick6-c++@3.14; \
    # ( \
    #     ln -s /usr/bin/animate-6 /usr/bin/animate && \
    #     ln -s /usr/bin/compare-6 /usr/bin/compare && \
    #     ln -s /usr/bin/composite-6 /usr/bin/composite && \
    #     ln -s /usr/bin/conjure-6 /usr/bin/conjure && \
    #     ln -s /usr/bin/convert-6 /usr/bin/convert && \
    #     ln -s /usr/bin/display-6 /usr/bin/display && \
    #     ln -s /usr/bin/identify-6 /usr/bin/identify && \
    #     ln -s /usr/bin/import-6 /usr/bin/import && \
    #     ln -s /usr/bin/mogrify-6 /usr/bin/mogrify && \
    #     ln -s /usr/bin/montage-6 /usr/bin/montage && \
    #     ln -s /usr/bin/stream-6 /usr/bin/stream \
    # ); \
    ldconfig; \
    pkg-config --cflags --libs MagickWand; \
    deactivate; \
    \
    # cleanup
    apk del .build-deps; \
    rm -rf /var/cache/apk/*; \
    rm -rf /tmp/*;

RUN \
    go env -w GOPRIVATE=localhost; \
    git config --global user.name "root"; \
    git config --global user.email "root@localdomain.com"; \
    git config --global http.sslverify "false";

WORKDIR /export/
ENTRYPOINT [ "/bin/sh", "-c" ]
